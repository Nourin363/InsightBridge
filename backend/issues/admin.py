from django.contrib import admin
from .models import Issue

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'category', 'priority', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'description')
