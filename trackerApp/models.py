from django.db import models

class Developer(models.Model):
    """Table to store the Project Owners / Developers so they aren't typed manually every time."""
    name = models.CharField(max_length=255, unique=True)
    contact_info = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class ProjectApplication(models.Model):
    """Main table for the DHSUD Compliance Tracking"""

    # --- Dropdown Choices ---
    STATUS_CHOICES = [
        ('Approved', 'Approved'),
        ('Denied', 'Denied'),
        ('Archived', 'Archived'),
        ('Ongoing', 'Ongoing'),
        ('Endorsed to HREDRB', 'Endorsed to HREDRB'),
    ]

    APPLICATION_TYPE_CHOICES = [
        ('New Application', 'New Application'),
        ('Reactivated', 'Reactivated Application'),
        ('Replacement', 'Replacement'),
    ]

    CATEGORY_CHOICES = [
        ('Main', 'Main'),
        ('Compliance', 'Compliance'),
    ]

    # --- Database Fields ---
    
    # Core Details
    name_of_proj = models.CharField(max_length=255, verbose_name="Name of Project")
    proj_owner_dev = models.CharField(max_length=255, blank=True, null=True)
    proj_type = models.CharField(max_length=100, null=True, blank=True, verbose_name="Project Type")
    
    # Application Status & Types
    type_of_application = models.CharField(max_length=50, choices=APPLICATION_TYPE_CHOICES, null=True, blank=True)
    status_of_application = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Ongoing')
    main_or_compliance = models.CharField(max_length=20, choices=CATEGORY_CHOICES, null=True, blank=True)
    
    # The JSONField to handle the React checkboxes
    crls_options = models.JSONField(blank=True, null=True, default=list, verbose_name="CR/LS Options")
    
    # Dates 
    date_filed = models.DateField(null=True, blank=True)
    date_issued = models.DateField(null=True, blank=True)
    date_completion = models.DateField(null=True, blank=True)
    
    # Identifiers
    cr_no = models.CharField(max_length=100, null=True, blank=True, verbose_name="CR No.")
    ls_no = models.CharField(max_length=100, null=True, blank=True, verbose_name="LS No.")
    
    # Location
    prov = models.CharField(max_length=100, null=True, blank=True, verbose_name="Province")
    mun_city = models.CharField(max_length=100, null=True, blank=True, verbose_name="Municipality/City")
    street_brgy = models.CharField(max_length=255, null=True, blank=True, verbose_name="Street/Brgy")

    # Metadata
    date_archived = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name_of_proj} - {self.status_of_application}"