from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0001_initial'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='favorite_songs',
            field=models.ManyToManyField(blank=True, related_name='favorited_by', to='music.song'),
        ),
    ]
