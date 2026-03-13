from django.db import models
from django.contrib.auth.models import User


class Issue(models.Model):

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_review', 'In Review'),
        ('resolved', 'Resolved'),
    ]

    CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('billing', 'Billing'),
        ('ui', 'UI/UX'),
        ('performance', 'Performance'),
        ('other', 'Other'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]


    # Basic Issue Information
    title = models.CharField(max_length=255)
    description = models.TextField()


    # Issue Classification
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other'
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )


    # ⭐ Explanation Intelligence (CORE FEATURE)
    explanation = models.TextField(
        blank=True,
        null=True
    )


    # ⭐ Explanation Metadata (VERY IMPORTANT)
    explained_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='explained_issues'
    )


    # User who created issue
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='issues'
    )


    # Time Tracking
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    # ⭐ When explanation added
    explained_at = models.DateTimeField(
        null=True,
        blank=True
    )


    def __str__(self):
        return self.title

class Notification(models.Model):

    NOTIFICATION_TYPES = (
        ("issue_reported", "Issue Reported"),
        ("issue_updated", "Issue Updated"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    message = models.TextField()

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.message[:40]}"