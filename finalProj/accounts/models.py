# from django.db import models
# from django.contrib.auth.models import User


# class SchedulerPlan(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="plans")
#     title = models.CharField(max_length=255)
#     total_days = models.IntegerField()
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.title} - {self.user.username}"


# class DayPlan(models.Model):
#     plan = models.ForeignKey(SchedulerPlan, related_name="days", on_delete=models.CASCADE)
#     day_number = models.IntegerField()
#     topic = models.CharField(max_length=255)
#     plan_type = models.CharField(max_length=50)  # study / revision
#     data = models.JSONField(default=dict)

#     completed = models.BooleanField(default=False)
#     time_spent = models.IntegerField(default=0)  # minutes studied
#     score = models.IntegerField(default=0)       # self rating (1-10)

#     class Meta:
#         ordering = ["day_number"]

#     def __str__(self):
#         return f"Day {self.day_number} - {self.plan.title}"
    

# class CSFundPlan(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cs_plans")
#     subject = models.CharField(max_length=255)
#     total_days = models.IntegerField()
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.subject} - {self.user.username}"


# class CSDayPlan(models.Model):
#     plan = models.ForeignKey(CSFundPlan, related_name="days", on_delete=models.CASCADE)
#     day_number = models.IntegerField()
#     topic = models.CharField(max_length=255)
#     data = models.JSONField(default=dict)

#     completed = models.BooleanField(default=False)

#     class Meta:
#         ordering = ["day_number"]

#     def __str__(self):
#         return f"Day {self.day_number} - {self.plan.subject}"



# from django.db import models
# from django.contrib.auth.models import User

# class Task(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     name = models.CharField(max_length=255)

#     def __str__(self):
#         return self.name

# class Progress(models.Model):
#     task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="progresses")
#     day = models.PositiveIntegerField()
#     done = models.BooleanField(default=False)

#     class Meta:
#         unique_together = ("task", "day")



from django.db import models
from django.contrib.auth.models import User

class SchedulerPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="plans")
    title = models.CharField(max_length=255)
    total_days = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class DayPlan(models.Model):
    plan = models.ForeignKey(SchedulerPlan, related_name="days", on_delete=models.CASCADE)
    day_number = models.IntegerField()
    topic = models.CharField(max_length=255)
    plan_type = models.CharField(max_length=50)  # study / revision
    data = models.JSONField(default=dict)
    completed = models.BooleanField(default=False)
    time_spent = models.IntegerField(default=0)  # minutes studied
    score = models.IntegerField(default=0)       # self rating (1-10)

    class Meta:
        ordering = ["day_number"]

    def __str__(self):
        return f"Day {self.day_number} - {self.plan.title}"


class CSFundPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cs_plans")
    subject = models.CharField(max_length=255)
    total_days = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - {self.user.username}"


class CSDayPlan(models.Model):
    plan = models.ForeignKey(CSFundPlan, related_name="days", on_delete=models.CASCADE)
    day_number = models.IntegerField()
    topic = models.CharField(max_length=255)
    data = models.JSONField(default=dict)
    completed = models.BooleanField(default=False)

    class Meta:
        ordering = ["day_number"]

    def __str__(self):
        return f"Day {self.day_number} - {self.plan.subject}"


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Progress(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="progresses")
    day = models.PositiveIntegerField()
    done = models.BooleanField(default=False)

    class Meta:
        unique_together = ("task", "day")


# --------------------------
# TrackerSetting model to store days per user
class TrackerSetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    days = models.PositiveIntegerField(default=1)  # default 1 day

    def __str__(self):
        return f"{self.user.username} - {self.days} days"