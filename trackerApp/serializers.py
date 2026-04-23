from rest_framework import serializers
from .models import (
    ProjectApplication, Salesperson, Province, CityMunicipality, Barangay,
    ProjectType, ApplicationType, ApplicationStatus, MainComplianceOption, CrlsOption
)

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = '__all__'

class CityMunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CityMunicipality
        fields = '__all__'

class BarangaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Barangay
        fields = '__all__'

class ProjectApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectApplication
        fields = '__all__'

class SalespersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salesperson
        fields = '__all__'

class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectType
        fields = '__all__'

class ApplicationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationType
        fields = '__all__'

class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatus
        fields = '__all__'

class MainComplianceOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainComplianceOption
        fields = '__all__'

class CrlsOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrlsOption
        fields = '__all__'
