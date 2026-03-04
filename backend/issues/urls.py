from django.urls import path
from .views import protected_test, create_issue, list_issues, update_explanation, admin_dashboard_stats, recent_issues
from .views_ai import ai_explain_issue

urlpatterns = [
    path('protected/', protected_test),
    path('create/', create_issue),
    path('list/', list_issues),
    
    # admin-only
    path('explain/<int:issue_id>/', update_explanation),
    path('admin-dashboard/', admin_dashboard_stats),
    path('recent/', recent_issues),
    path('ai-explain/<int:id>/',ai_explain_issue),
]
