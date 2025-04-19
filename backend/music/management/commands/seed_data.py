from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from music.models import Artist, Album, Song, Playlist
from datetime import date
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting to seed data...'))

        # Clear existing data (optional, comment out if you don't want to delete)
        Playlist.objects.all().delete()
        Song.objects.all().delete()
        Album.objects.all().delete()
        Artist.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        # Create users
        users = [
            {'username': 'testuser1', 'email': 'test1@example.com', 'password': 'password123', 'is_premium': False},
            {'username': 'testuser2', 'email': 'test2@example.com', 'password': 'password123', 'is_premium': True},
        ]
        user_objects = []
        for user_data in users:
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                is_premium=user_data['is_premium']
            )
            user_objects.append(user)
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))

        # Create artists
        artists = [
            {'name': 'Artist One', 'bio': 'A popular artist', 'cover_image': 'http://example.com/artist1.jpg'},
            {'name': 'Artist Two', 'bio': 'An indie artist', 'cover_image': 'http://example.com/artist2.jpg'},
        ]
        artist_objects = []
        for artist_data in artists:
            artist = Artist.objects.create(**artist_data)
            artist_objects.append(artist)
            self.stdout.write(self.style.SUCCESS(f'Created artist: {artist.name}'))

        # Create albums
        albums = [
            {'title': 'Album One', 'artist': artist_objects[0], 'release_date': date(2023, 1, 1), 'cover_image': 'http://example.com/album1.jpg'},
            {'title': 'Album Two', 'artist': artist_objects[1], 'release_date': date(2024, 1, 1), 'cover_image': 'http://example.com/album2.jpg'},
        ]
        album_objects = []
        for album_data in albums:
            album = Album.objects.create(**album_data)
            album_objects.append(album)
            self.stdout.write(self.style.SUCCESS(f'Created album: {album.title}'))

        # Create songs
        songs = [
            {'title': 'Song One', 'artist': artist_objects[0], 'album': album_objects[0], 'duration': 180, 'file_path': 'http://example.com/song1.mp3', 'is_premium': False, 'cover_image': 'http://example.com/song1.jpg'},
            {'title': 'Song Two', 'artist': artist_objects[1], 'album': album_objects[1], 'duration': 200, 'file_path': 'http://example.com/song2.mp3', 'is_premium': True, 'cover_image': 'http://example.com/song2.jpg'},
            {'title': 'Song Three', 'artist': artist_objects[0], 'album': album_objects[0], 'duration': 220, 'file_path': 'http://example.com/song3.mp3', 'is_premium': False, 'cover_image': 'http://example.com/song3.jpg'},
        ]
        song_objects = []
        for song_data in songs:
            song = Song.objects.create(**song_data)
            song_objects.append(song)
            self.stdout.write(self.style.SUCCESS(f'Created song: {song.title}'))

        # Create playlists
        for user in user_objects:
            playlist = Playlist.objects.create(
                name=f"{user.username}'s Playlist",
                user=user,
                is_public=random.choice([True, False]),
                cover_image='http://example.com/playlist.jpg'
            )
            # Add random songs to playlist
            playlist.songs.add(*random.sample(song_objects, k=2))
            self.stdout.write(self.style.SUCCESS(f'Created playlist: {playlist.name} for user: {user.username}'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))