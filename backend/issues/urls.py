from django.urls import path
from .views import protected_test, create_issue, list_issues, update_explanation, admin_dashboard_stats, recent_issues, issue_detail
from .views_ai import ai_explain_issue
from .views import create_issue, my_issues, register_user,user_profile, user_notifications, update_issue

urlpatterns = [
    path('protected/', protected_test),
    path('create/', create_issue),
    path('list/', list_issues),
    
    # admin-only
    path('explain/<int:issue_id>/', update_explanation),
    path('admin-dashboard/', admin_dashboard_stats),
    path('recent/', recent_issues),
    path('issue/<int:id>/', issue_detail),
    path('ai-explain/<int:id>/',ai_explain_issue),

    # user
    path("register/", register_user),
    path("create/", create_issue),
    path("my-issues/", my_issues),
    path("update/<int:pk>/", update_issue),
    path("users/profile/", user_profile),
    path("notifications/", user_notifications),
]
