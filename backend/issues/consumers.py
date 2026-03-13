import json
from channels.generic.websocket import AsyncWebsocketConsumer


class IssueConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.group_name = "issues"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # test message when connected
        await self.send(text_data=json.dumps({
            "type": "connection",
            "message": "WebSocket connected successfully"
        }))


    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )


    async def receive(self, text_data):

        data = json.loads(text_data)

        # echo message for testing
        await self.send(text_data=json.dumps({
            "type": "echo",
            "message": data
        }))


    async def issue_update(self, event):

        await self.send(text_data=json.dumps({
            "type": "issue_update",
            "issue_id": event["issue_id"],
            "status": event["status"],
            "explanation": event["explanation"]
        }))