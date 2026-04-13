from rest_framework import serializers
from .models import ProjectApplication, Salesperson

class ProjectApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectApplication
        fields = '__all__'

class SalespersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salesperson
        fields = '__all__'