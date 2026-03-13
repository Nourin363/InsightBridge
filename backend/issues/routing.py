from django.urls import path
from .consumers import IssueConsumer

websocket_urlpatterns = [
    path("ws/issues/", IssueConsumer.as_asgi()),
]