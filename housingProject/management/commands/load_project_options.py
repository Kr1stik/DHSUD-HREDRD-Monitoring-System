from django.core.management.base import BaseCommand
from trackerApp.models import ProjectType, ApplicationType, ApplicationStatus, MainComplianceOption, CrlsOption

class Command(BaseCommand):
    help = 'Loads static project options into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Loading project options...")

        options = {
            'projTypes': ["OM Subd", "OM Condo", "MCH Subd", "MCH Condo", "EH Subd", "EH Condo", "SH Subd", "SH Condo", "MP", "COL/OS", "Commercial Condo", "Industrial Subd", "Commercial Subd", "Farmlot Subd"],
            'appTypes': ["New Application", "Reactivated", "Replacement"],
            'statusOptions': ["Ongoing", "Approved", "Denied", "Endorsed to HREDRB"],
            'mainCompOptions': ["Main", "Compliance"],
            'crlsOptions': ["New LS", "New CR", "Amended LS", "Amended CR", "Replacement of LS", "Replacement of CR", "Compliance Entry Only"]
        }

        for name in options['projTypes']: ProjectType.objects.get_or_create(name=name)
        for name in options['appTypes']: ApplicationType.objects.get_or_create(name=name)
        for name in options['statusOptions']: ApplicationStatus.objects.get_or_create(name=name)
        for name in options['mainCompOptions']: MainComplianceOption.objects.get_or_create(name=name)
        for name in options['crlsOptions']: CrlsOption.objects.get_or_create(name=name)

        self.stdout.write(self.style.SUCCESS('SUCCESS: All project options loaded!'))