from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Issue
from .serializers import IssueSerializer
from django.db.models import Count
from rest_framework.permissions import IsAdminUser

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_test(request):
    return Response({
        "username": request.user.username,
        "is_staff": request.user.is_staff,
        "is_superuser": request.user.is_superuser
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_issue(request):
    issue = Issue.objects.create(
        title=request.data.get('title'),
        description=request.data.get('description'),
        created_by=request.user
    )
    return Response({
        "id": issue.id,
        "message": "Issue created successfully"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_issues(request):
    user = request.user

    # Admin sees all, user sees only their own
    if user.is_staff:
        issues = Issue.objects.all().order_by('-created_at')
    else:
        issues = Issue.objects.filter(created_by=user).order_by('-created_at')

    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)

from rest_framework.permissions import IsAdminUser


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_explanation(request, issue_id):
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        return Response({"error": "Issue not found"}, status=404)

    issue.explanation = request.data.get('explanation', issue.explanation)
    issue.status = request.data.get('status', issue.status)
    issue.save()

    return Response({
        "message": "Explanation updated successfully",
        "issue_id": issue.id,
        "status": issue.status,
        "explanation": issue.explanation
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_stats(request):

    issues = Issue.objects.all()

    total_issues = issues.count()

    # ===== Lifecycle Totals =====
    lifecycle_totals = {
        "open": issues.filter(status='open').count(),
        "in_review": issues.filter(status='in_review').count(),
        "resolved": issues.filter(status='resolved').count(),
    }

    # ===== Priority Totals =====
    priority_totals = {
        "high": issues.filter(priority='high').count(),
        "medium": issues.filter(priority='medium').count(),
        "low": issues.filter(priority='low').count(),
    }

    # ===== Domain Breakdown =====
    domain_names = issues.values_list("category", flat=True).distinct()

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