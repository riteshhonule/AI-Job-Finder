from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .models import UserProfile, Resume, Skill
from .serializers import UserSerializer, UserRegisterSerializer, SkillSerializer, ResumeSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def skills(self, request):
        if request.method == 'GET':
            skills = Skill.objects.filter(user=request.user)
            serializer = SkillSerializer(skills, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = SkillSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_resume(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        resume, created = Resume.objects.get_or_create(user=request.user)
        resume.file = file
        resume.save()
        
        serializer = ResumeSerializer(resume)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def resume(self, request):
        try:
            resume = Resume.objects.get(user=request.user)
            serializer = ResumeSerializer(resume)
            return Response(serializer.data)
        except Resume.DoesNotExist:
            return Response({'error': 'No resume found'}, status=status.HTTP_404_NOT_FOUND)
