# music/models.py
from django.db import models

class Artist(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'artists'

    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=100)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    release_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'albums'

    def __str__(self):
        return self.title

class Song(models.Model):
    title = models.CharField(max_length=100)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='songs')
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='songs', blank=True, null=True)
    duration = models.IntegerField()
    file_path = models.CharField(max_length=255)
    is_premium = models.BooleanField(default=False)
    cover_image = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'songs'

    def __str__(self):
        return self.title