from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from users.models import Resume, Skill
from jobs.models import Job, JobSkill
from .models import MatchResult
from .serializers import MatchResultSerializer
from .nlp_utils import calculate_skill_match, calculate_match_score, calculate_ai_match_score
from .resume_parser import parse_resume
import logging

logger = logging.getLogger(__name__)


class MatchViewSet(viewsets.ModelViewSet):
    queryset = MatchResult.objects.all()
    serializer_class = MatchResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MatchResult.objects.filter(user=self.request.user).order_by('-match_score', '-created_at')
    
    def list(self, request, *args, **kwargs):
        """Override list to add pagination support."""
        queryset = self.get_queryset()
        
        # Get pagination parameters
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 10)
        
        try:
            page_size = int(page_size)
            if page_size < 1 or page_size > 100:
                page_size = 10
        except (ValueError, TypeError):
            page_size = 10
        
        # Apply pagination
        paginator = Paginator(queryset, page_size)
        try:
            page_obj = paginator.page(page)
        except (PageNotAnInteger, EmptyPage):
            page_obj = paginator.page(1)
        
        serializer = self.get_serializer(page_obj.object_list, many=True)
        
        return Response({
            'results': serializer.data,
            'matches': serializer.data,
            'total_matches': paginator.count,
            'page': page_obj.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def run_matching(self, request):
        """Run job matching for current user using AI-based skill matching with pagination support."""
        try:
            import random
            
            user = request.user
            page = request.data.get('page', 1)
            page_size = request.data.get('page_size', 10)
            sort_by = request.data.get('sort_by', 'score')  # 'score', 'salary', 'location', 'random'
            min_score = request.data.get('min_score', 0)  # Minimum match score threshold
            
            # Get user skills
            user_skills = list(Skill.objects.filter(user=user).values_list('name', flat=True))
            
            if not user_skills:
                return Response(
                    {'error': 'No skills found. Please add skills or upload a resume.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get all jobs
            jobs = Job.objects.all()
            
            if not jobs.exists():
                return Response(
                    {'error': 'No jobs available for matching.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Clear previous matches for fresh results
            MatchResult.objects.filter(user=user).delete()
            
            matches = []
            for job in jobs:
                try:
                    job_skills = list(JobSkill.objects.filter(job=job).values_list('skill_name', flat=True))
                    
                    if not job_skills:
                        continue
                    
                    # Use AI-enhanced matching
                    matched, missing = calculate_skill_match(user_skills, job_skills)
                    score = calculate_ai_match_score(user_skills, job_skills, matched, missing)
                    
                    # Filter by minimum score threshold
                    if score >= min_score:
                        match = MatchResult.objects.create(
                            user=user,
                            job=job,
                            match_score=score,
                            matched_skills=matched,
                            missing_skills=missing
                        )
                        matches.append(match)
                except Exception as e:
                    logger.error(f"Error processing job {job.id}: {str(e)}")
                    continue
            
            # Get all matches with appropriate sorting
            all_matches = MatchResult.objects.filter(user=user)
            
            # Apply sorting based on sort_by parameter
            if sort_by == 'salary':
                all_matches = all_matches.order_by('-job__salary_max', '-match_score')
            elif sort_by == 'location':
                all_matches = all_matches.order_by('job__location', '-match_score')
            elif sort_by == 'random':
                all_matches = all_matches.order_by('?')  # Random ordering
            else:  # Default: score
                all_matches = all_matches.order_by('-match_score', '-created_at')
            
            # Apply pagination
            paginator = Paginator(all_matches, page_size)
            try:
                page_obj = paginator.page(page)
            except Exception as e:
                logger.error(f"Pagination error: {str(e)}")
                page_obj = paginator.page(1)
            
            serializer = self.get_serializer(page_obj.object_list, many=True)
            
            return Response({
                'message': f'Matching completed. Found {len(matches)} matching jobs.',
                'matches': serializer.data,
                'total_matches': len(matches),
                'page': page,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error in run_matching: {str(e)}")
            return Response(
                {'error': f'Failed to run matching: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def parse_and_extract(self, request):
        """Parse resume and extract skills."""
        user = request.user
        
        try:
            resume = Resume.objects.get(user=user)
        except Resume.DoesNotExist:
            return Response(
                {'error': 'No resume found. Please upload a resume first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Parse resume
        parsed_data = parse_resume(resume.file)
        
        # Update resume raw text
        resume.raw_text = parsed_data['raw_text']
        resume.save()
        
        # Clear existing extracted skills
        Skill.objects.filter(user=user, extracted_from_resume=True).delete()
        
        # Add extracted skills
        for skill_name in parsed_data['skills']:
            Skill.objects.create(
                user=user,
                name=skill_name,
                proficiency='intermediate',
                extracted_from_resume=True
            )
        
        return Response({
            'message': 'Resume parsed successfully.',
            'skills': parsed_data['skills'],
            'email': parsed_data['email'],
            'phone': parsed_data['phone'],
            'raw_text': parsed_data['raw_text']
        }, status=status.HTTP_200_OK)
