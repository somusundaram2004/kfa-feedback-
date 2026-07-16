from rest_framework import serializers
from feedback.models import Feedback
import datetime, random, string

def generate_kfa_id():
    year = datetime.datetime.now().year
    suffix = ''.join(random.choices(string.digits, k=6))
    return f"KFA-{year}-{suffix}"

class FeedbackSerializer(serializers.ModelSerializer):
    # Legacy camelCase aliases (kept for backward compat)
    id = serializers.SerializerMethodField()
    digitalToolHelp = serializers.CharField(source='digital_tool_help', required=False, allow_blank=True)
    digitalToolTypes = serializers.JSONField(source='digital_tool_types', required=False, default=list)
    userGroup = serializers.CharField(source='user_group', required=False, allow_blank=True)
    solution = serializers.SerializerMethodField()

    # KFA fields (camelCase for frontend)
    studentName = serializers.CharField(source='student_name', required=False, allow_blank=True)
    contactPreference = serializers.CharField(source='contact_preference', required=False, allow_blank=True)
    phoneNumber = serializers.CharField(source='phone_number', required=False, allow_blank=True, allow_null=True)
    starRating = serializers.IntegerField(source='star_rating', required=False, allow_null=True)
    feedbackCategory = serializers.CharField(source='feedback_category', required=False, allow_blank=True)
    mainFeedback = serializers.CharField(source='main_feedback', required=False, allow_blank=True)
    improvementAreas = serializers.JSONField(source='improvement_areas', required=False, default=list)
    additionalComments = serializers.CharField(source='additional_comments', required=False, allow_blank=True)
    feedbackId = serializers.CharField(source='feedback_id', required=False, allow_blank=True)

    # New Questions
    learningProgress = serializers.CharField(source='learning_progress', required=False, allow_blank=True)
    preferredContactMethod = serializers.CharField(source='preferred_contact_method', required=False, allow_blank=True)

    class Meta:
        model = Feedback
        fields = [
            'id', 'timestamp', 'status', 'priority',
            # Legacy
            'name', 'department',
            'problems', 'frequency', 'affected',
            'digitalToolHelp', 'digitalToolTypes', 'userGroup',
            'description', 'solution',
            # KFA
            'studentName', 'branch', 'contactPreference', 'phoneNumber',
            'starRating', 'feedbackCategory', 'mainFeedback',
            'improvementAreas', 'expectations', 'recommend',
            'learningProgress', 'preferredContactMethod',
            'additionalComments', 'feedbackId',
        ]

    def get_id(self, obj):
        return f"fb-{obj.id}"

    def get_solution(self, obj):
        if not obj.solution_name:
            return None
        return {
            'name': obj.solution_name,
            'type': obj.solution_type,
            'status': obj.solution_status,
            'description': obj.solution_description
        }

    def create(self, validated_data):
        # Auto-generate feedbackId if not set
        if not validated_data.get('feedback_id'):
            validated_data['feedback_id'] = generate_kfa_id()
        # Map student_name → name for legacy compat
        if validated_data.get('student_name') and not validated_data.get('name'):
            validated_data['name'] = validated_data['student_name']
        if validated_data.get('feedback_category') and not validated_data.get('problems'):
            validated_data['problems'] = [validated_data['feedback_category']]
        return super().create(validated_data)

    def update(self, instance, validated_data):
        solution_data = self.initial_data.get('solution')
        if solution_data is not None:
            if solution_data == '' or solution_data is None:
                instance.solution_name = None
                instance.solution_type = None
                instance.solution_status = None
                instance.solution_description = None
            elif isinstance(solution_data, dict):
                instance.solution_name = solution_data.get('name', instance.solution_name)
                instance.solution_type = solution_data.get('type', instance.solution_type)
                instance.solution_status = solution_data.get('status', instance.solution_status)
                instance.solution_description = solution_data.get('description', instance.solution_description)
        return super().update(instance, validated_data)
