# music/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Song
from .serializers import SongSerializer

class SongListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        songs = Song.objects.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

class SongDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            song = Song.objects.get(pk=pk)
            serializer = SongSerializer(song)
            return Response(serializer.data)
        except Song.DoesNotExist:
            return Response({"detail": "Song not found"}, status=status.HTTP_404_NOT_FOUND)