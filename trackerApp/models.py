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

    #Google Drive
    drive_link = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.name_of_proj} - {self.status_of_application}"

class SystemSettings(models.Model):
    last_cloud_sync = models.DateTimeField(null=True, blank=True)

    def __clstr__(self):
        return "System Settings"

class Salesperson(models.Model):
    # Personal Info
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True, null=True)
    sex = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')])
    tin = models.CharField(max_length=50, blank=True, null=True)
    phone_no = models.CharField(max_length=50, blank=True, null=True)

    # Address Info
    address_street = models.CharField(max_length=255, blank=True, null=True)
    city_municipality = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=100, default='Negros Occidental')

    # PRC & Registration
    prc_accre_no = models.CharField(max_length=100, blank=True, null=True)
    sp_prc_reg_validity = models.DateField(blank=True, null=True)
    sn_certificate_of_reg = models.CharField(max_length=100, blank=True, null=True)
    prn = models.CharField(max_length=100, blank=True, null=True)

    # Broker Details
    broker_prn = models.CharField(max_length=100, blank=True, null=True)
    broker_first_name = models.CharField(max_length=100, blank=True, null=True)
    broker_middle_name = models.CharField(max_length=100, blank=True, null=True)
    broker_last_name = models.CharField(max_length=100, blank=True, null=True)
    broker_suffix = models.CharField(max_length=10, blank=True, null=True)
    broker_date_of_reg = models.DateField(blank=True, null=True)
    broker_place_of_reg = models.CharField(max_length=255, blank=True, null=True)

    # Payment/Bond
    or_no_registration = models.CharField(max_length=100, blank=True, null=True)
    amount_reg = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    or_date = models.DateField(blank=True, null=True)
    surety_bond_validity = models.DateField(blank=True, null=True)
    or_no_cash_bond = models.CharField(max_length=100, blank=True, null=True)
    amount_cb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # System Dates
    date_filed = models.DateField(blank=True, null=True)
    date_of_registration = models.DateField(blank=True, null=True)
    reg_month_year = models.CharField(max_length=20, blank=True, null=True)
    date_released = models.DateField(blank=True, null=True)
    released_month = models.CharField(max_length=50, blank=True, null=True)
    released_date = models.CharField(max_length=20, blank=True, null=True)
    released_year = models.CharField(max_length=10, blank=True, null=True)

    # Application Type
    is_renewal = models.BooleanField(default=False)

    # Valid Years
    valid_years = models.JSONField(default=list, blank=True, null=True)

    note = models.TextField(blank=True)
    photo = models.ImageField(upload_to='salesperson_photos/', null=True, blank=True)

    date_archived = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"