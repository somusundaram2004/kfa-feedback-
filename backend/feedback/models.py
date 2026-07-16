from django.db import models

class Feedback(models.Model):
    # ── Legacy fields (kept for backward compatibility) ──────────────────────
    problems = models.JSONField(default=list)
    frequency = models.CharField(max_length=50, blank=True, default='')
    affected = models.CharField(max_length=50, blank=True, default='')
    digital_tool_help = models.CharField(max_length=50, blank=True, default='')
    digital_tool_types = models.JSONField(default=list)
    user_group = models.CharField(max_length=50, blank=True, default='')
    description = models.TextField(blank=True, default='')
    priority = models.CharField(max_length=20, default='Low')
    status = models.CharField(max_length=20, default='New')
    timestamp = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100, default='Anonymous')
    department = models.CharField(max_length=100, default='N/A')

    # Linked Digital Solution fields
    solution_name = models.CharField(max_length=255, null=True, blank=True)
    solution_type = models.CharField(max_length=50, null=True, blank=True)
    solution_status = models.CharField(max_length=50, null=True, blank=True)
    solution_description = models.TextField(null=True, blank=True)

    # ── KFA Music Academy fields ─────────────────────────────────────────────
    # Section 1
    student_name = models.CharField(max_length=150, blank=True, default='')
    branch = models.CharField(max_length=100, blank=True, default='')
    contact_preference = models.CharField(max_length=10, blank=True, default='No')
    phone_number = models.CharField(max_length=20, null=True, blank=True)

    # Section 2
    star_rating = models.IntegerField(null=True, blank=True)

    # Section 3
    feedback_category = models.CharField(max_length=50, blank=True, default='')

    # Section 4
    main_feedback = models.TextField(blank=True, default='')

    # Section 5
    improvement_areas = models.JSONField(default=list)

    # Section 6
    expectations = models.TextField(blank=True, default='')

    # Section 7
    recommend = models.CharField(max_length=10, blank=True, default='')

    # New Questions
    learning_progress = models.CharField(max_length=20, blank=True, default='')
    preferred_contact_method = models.CharField(max_length=20, blank=True, default='')

    additional_comments = models.TextField(blank=True, default='')

    # Auto-generated KFA Feedback ID (KFA-YYYY-XXXXXX)
    feedback_id = models.CharField(max_length=30, blank=True, default='')

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.feedback_id or 'KFA-???'} — {self.student_name or self.name} — {self.status}"
