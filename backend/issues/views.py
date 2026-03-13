from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from django.db.models import Count

from .models import Issue
from .serializers import IssueSerializer

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


# ===============================
# AUTH TEST
# ===============================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_test(request):

    return Response({
        "username": request.user.username,
        "is_staff": request.user.is_staff,
        "is_superuser": request.user.is_superuser
    })


# ===============================
# USER: CREATE ISSUE
# ===============================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_issue(request):

    try:

        title = request.data.get("title")
        description = request.data.get("description")
        category = request.data.get("category")
        priority = request.data.get("priority")

        issue = Issue.objects.create(
            title=title,
            description=description,
            category=category,
            priority=priority,
            created_by=request.user
        )

        return Response({
            "message": "Issue created successfully",
            "issue_id": issue.id
        })

    except Exception as e:
        return Response({"error": str(e)})


# ===============================
# USER: GET MY ISSUES
# ===============================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_issues(request):

    issues = Issue.objects.filter(
        created_by=request.user
    ).order_by("-created_at")

    data = []

    for issue in issues:

        data.append({
            "id": issue.id,
            "title": issue.title,
            "description": issue.description,
            "category": issue.category,
            "priority": issue.priority,
            "status": issue.status,
            "explanation": issue.explanation,
            "created_at": issue.created_at
        })

    return Response(data)


# ===============================
# LIST ISSUES (ADMIN OR USER)
# ===============================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_issues(request):

    user = request.user

    if user.is_staff:
        issues = Issue.objects.all().order_by('-created_at')
    else:
        issues = Issue.objects.filter(
            created_by=user
        ).order_by('-created_at')

    serializer = IssueSerializer(issues, many=True)

    return Response(serializer.data)


# ===============================
# ISSUE DETAIL
# ===============================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def issue_detail(request, id):

    try:

        issue = Issue.objects.get(id=id)
        serializer = IssueSerializer(issue)

        return Response(serializer.data)

    except Issue.DoesNotExist:

        return Response(
            {"error": "Issue not found"},
            status=404
        )


# ===============================
# ADMIN: UPDATE EXPLANATION
# ===============================

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_explanation(request, issue_id):

    try:

        issue = Issue.objects.get(id=issue_id)

    except Issue.DoesNotExist:

        return Response(
            {"error": "Issue not found"},
            status=404
        )

    issue.explanation = request.data.get(
        'explanation',
        issue.explanation
    )

    issue.status = request.data.get(
        'status',
        issue.status
    )

    issue.save()

    # ===============================
    # WEBSOCKET REALTIME UPDATE
    # ===============================

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "issues",
        {
            "type": "issue_update",
            "issue_id": issue.id,
            "status": issue.status,
            "explanation": issue.explanation
        }
    )

    return Response({
        "message": "Explanation updated successfully",
        "issue_id": issue.id,
        "status": issue.status,
        "explanation": issue.explanation
    })


# ===============================
# ADMIN DASHBOARD STATS
# ===============================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_stats(request):

    issues = Issue.objects.all()

    total_issues = issues.count()

    lifecycle_totals = {
        "open": issues.filter(status='open').count(),
        "in_review": issues.filter(status='in_review').count(),
        "resolved": issues.filter(status='resolved').count(),
    }

    priority_totals = {
        "high": issues.filter(priority='high').count(),
        "medium": issues.filter(priority='medium').count(),
        "low": issues.filter(priority='low').count(),
    }

    domain_names = issues.values_list(
        "category",
        flat=True
    ).distinct()

    domains = []

    for domain in domain_names:

        domain_issues = issues.filter(category=domain)

        domains.append({
            "name": domain,
            "total": domain_issues.count(),

            "priority": {
                "high": domain_issues.filter(priority='high').count(),
                "medium": domain_issues.filter(priority='medium').count(),
                "low": domain_issues.filter(priority='low').count(),
            },

            "lifecycle": {
                "open": domain_issues.filter(status='open').count(),
                "in_review": domain_issues.filter(status='in_review').count(),
                "resolved": domain_issues.filter(status='resolved').count(),
            }
        })

    return Response({
        "total_issues": total_issues,
        "lifecycle_totals": lifecycle_totals,
        "priority_totals": priority_totals,
        "domains": domains
    })


# ===============================
# RECENT ISSUES
# ===============================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_issues(request):

    issues = Issue.objects.order_by("-created_at")[:5]

    data = [
        {
            "id": issue.id,
            "title": issue.title,
            "status": issue.status,
            "category": issue.category,
            "priority": issue.priority,
        }
        for issue in issues
    ]

    return Response(data)


# ===============================
# USER REGISTRATION
# ===============================

@api_view(["POST"])
def register_user(request):

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not password or not email:

        return Response(
            {"error": "All fields are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():

        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():

        return Response(
            {"error": "Email already registered"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {"message": "User created successfully"},
        status=status.HTTP_201_CREATED
    )
from .models import Issue, Notification
from .serializers import IssueSerializer


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_issue(request):

#     serializer = IssueSerializer(data=request.data)

#     if serializer.is_valid():

#         issue = serializer.save(created_by=request.user)

#         # SEND NOTIFICATION TO ADMINS
#         admins = User.objects.filter(is_staff=True)

#         for admin in admins:
#             Notification.objects.create(
#                 user=admin,
#                 message=f"New issue reported: {issue.title}",
#                 notification_type="issue_reported"
#             )

#         return Response(serializer.data)

    # return Response(serializer.errors, status=400)

@api_view(['PUT','PATCH'])
@permission_classes([IsAuthenticated])
def update_issue(request, pk):

    try:
        issue = Issue.objects.get(pk=pk)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=404)

    serializer = IssueSerializer(issue, data=request.data, partial=True)

    if serializer.is_valid():

        serializer.save()

        # SEND NOTIFICATION TO USER
        Notification.objects.create(
            user=issue.created_by,
            message=f"Your issue '{issue.title}' was updated",
            notification_type="issue_updated"
        )

        return Response(serializer.data)

    return Response(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):

    user = request.user

    return Response({
        "username": user.username,
        "email": user.email,
        "date_joined": user.date_joined
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_notifications(request):

    notifications = Notification.objects.filter(
        user=request.user
    ).order_by("-created_at")

    data = []

    for n in notifications:
        data.append({
            "id": n.id,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at
        })

    return Response(data)