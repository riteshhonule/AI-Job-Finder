from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Job, JobSkill
from .serializers import JobSerializer, JobSkillSerializer


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def search(self, request):
        query = request.query_params.get('q', '')
        jobs = Job.objects.filter(
            title__icontains=query
        ) | Job.objects.filter(
            description__icontains=query
        ) | Job.objects.filter(
            company__icontains=query
        )
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_skill(self, request, pk=None):
        job = self.get_object()
        skill_name = request.data.get('skill_name')
        importance = request.data.get('importance', 'required')
        
        if not skill_name:
            return Response({'error': 'skill_name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        job_skill, created = JobSkill.objects.get_or_create(
            job=job,
            skill_name=skill_name,
            defaults={'importance': importance}
        )
        serializer = JobSkillSerializer(job_skill)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
