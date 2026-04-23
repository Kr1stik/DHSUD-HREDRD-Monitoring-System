from django.core.management.base import BaseCommand
# IMPORTANT: If your models are in a different app, change 'housingProject.models' to your actual app name!
from trackerApp.models import Province, CityMunicipality, Barangay

class Command(BaseCommand):
    help = 'Bulk loads all Provinces, Cities, and Barangays into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting massive database import for NIR locations...")

        NIR_DATA = {
            "Negros Occidental": {
                "Bacolod City": ["Alangilan", "Alijis", "Banago", "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", "Barangay 21", "Barangay 22", "Barangay 23", "Barangay 24", "Barangay 25", "Barangay 26", "Barangay 27", "Barangay 28", "Barangay 29", "Barangay 30", "Barangay 31", "Barangay 32", "Barangay 33", "Barangay 34", "Barangay 35", "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39", "Barangay 40", "Barangay 41", "Bata", "Cabug", "Estefania", "Felisa", "Granada", "Handumanan", "Mandalagan", "Mansilingan", "Montevista", "Pahanocoy", "Punta Taytay", "Singcang-Airport", "Sum-ag", "Taculing", "Tangub", "Villamonte", "Vista Alegre"],
                "Bago City": ["Abuanan", "Alianza", "Atipuluan", "Bacong-Montilla", "Bagroy", "Balingasag", "Binubuhan", "Busay", "Calumangan", "Dulao", "Ilijan", "Lag-asan", "Ma-ao", "Mabini", "Mailum", "Malingin", "Napoles", "Pacol", "Poblacion", "Sagasa", "Sampinit", "Tabunan", "Taloc"],
                "Binalbagan": ["Amontay", "Bagroy", "Bi-ao", "Canmoros", "Enclaro", "Marina", "Pagla-um", "Payao", "Progreso", "San Jose", "San Juan", "San Pedro", "San Teodoro", "San Vicente", "Santo Rosario", "Santol"],
                "Cadiz City": ["Andres Bonifacio", "Banquerohan", "Barangay 1 Pob. (Zone 1)", "Barangay 2 Pob. (Zone 2)", "Barangay 3 Pob. (Zone 3)", "Barangay 4 Pob. (Zone 4)", "Barangay 5 Pob. (Zone 5)", "Barangay 6 Pob. (Zone 6)", "Burgos", "Cabahug", "Cadiz Viejo", "Caduha-an", "Celestino Villacin", "Daga", "V. F. Gustilo", "Jerusalem", "Luna", "Mabini", "Magsaysay", "Sicaba", "Tiglawigan", "Tinampa-an"],
                "Calatrava": ["Agboy", "Alimango", "Ani-e", "Bagacay", "Bantayanon", "Buenavista", "Cabungahan", "Calampisawan", "Cambayobo", "Castellano", "Cruz", "Dolis", "Hilub-Ang", "Hinab-Ong", "Igmaya-an", "Ilaya", "Laga-an", "Lemery", "Lipat-on", "Lo-ok", "Ma-aslob", "Macasilao", "Mahilum", "Malanog", "Malatas", "Marcelo", "Menchaca", "Mina-utok", "Minapasuk", "Pantao", "Patun-an", "Pinocutan", "Poblacion", "Refugio", "San Isidro", "Suba", "Telong", "Tigbao", "Tigbon", "Winu-an"],
                "Candoni": ["Agboy", "Bangkaya", "Cabia-an", "Caningay", "Gatuslao", "Haba", "Payauan", "Poblacion East", "Poblacion West"],
                "Cauayan": ["Abaca", "Baclao", "Basak", "Bulata", "Caliling", "Camalanda-an", "Camindangan", "Elihan", "Guiljungan", "Inayawan", "Isio", "Linaon", "Lumbia", "Mambugsay", "Man-Uling", "Masaling", "Molobolo", "Poblacion", "Sura", "Talacdan", "Tambad", "Tiling", "Tomina", "Tuyom", "Yahong"],
                "Enrique B. Magalona": ["Alacaygan", "Alicante", "Batea", "Canlusong", "Consing", "Cudangdang", "Damgo", "Gahit", "Latasan", "Manta-angan", "Nanca", "Pasiano", "Poblacion I", "Poblacion II", "Poblacion III", "San Isidro", "San Jose", "Santo Niño", "Tabigue", "Tanza", "Tomongtong", "Tuburan"],
                "Escalante City": ["Alimango", "Balintawak", "Binaguiohan", "Buenavista", "Cervantes", "Dian-ay", "Hacienda Fe", "Japitan", "Jonobjonob", "Langub", "Libertad", "Mabini", "Magsaysay", "Malasibog", "Old Poblacion", "Paitan", "Pinapugasan", "Rizal", "Tamlang", "Udtongan", "Washington"],
                "Himamaylan City": ["Aguisan", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Buenavista", "Cabadiangan", "Cabanbanan", "Carabalan", "Libacao", "Mahalang", "Mambagaton", "Nabali-an", "San Antonio", "Saraet", "Su-ay", "Talaban", "To-oy"],
                "Hinigaran": ["Anahaw", "Aranda", "Baga-as", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Bato", "Camba-og", "Candumarao", "Gargato", "Himaya", "Miranda", "Nanunga", "Narra", "Palayog", "Paticui", "Pilar", "Quiwi", "Tagda", "Tulunan"],
                "Hinoba-an": ["Alim", "Asia", "Bacuyangan", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Bulwangan", "Culasi", "Damutan", "Daug", "Pook", "San Rafael", "Sangke", "Talacagay"],
                "Ilog": ["Andulauan", "Balicotoc", "Barangay I (Pob.)", "Barangay II (Pob.)", "Bocana", "Calubang", "Canlamay", "Consuelo", "Dancalan", "Delicioso", "Galicia", "Manalad", "Pinggot", "Tabu", "Vista Alegre"],
                "Isabela": ["Amin", "Banogpe", "Bulad", "Bungahin", "Cabcab", "Camangcamang", "Campuyo", "Cansalongon", "Crossing Magallon", "Guintubhan", "Limalima", "Makilignit", "Mansablay", "Mayatik", "Nayon", "Panaquiao", "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4", "Poblacion 5", "Poblacion 6", "Poblacion 7", "Poblacion 8", "Poblacion 9", "Riverside", "Rumirang", "San Agustin", "Sebucauan", "Sikatuna", "Tinongan"],
                "Kabankalan City": ["Bantayan", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Barangay 6 (Pob.)", "Barangay 7 (Pob.)", "Barangay 8 (Pob.)", "Barangay 9 (Pob.)", "Binicuil", "Camingawan", "Camugao", "Carol-an", "Colonia Divina", "Daan Banua", "Dacongcogon", "Florentino Galang", "Hilamonan", "Inapoy", "Locotan", "Magballo", "Oringao", "Orong", "Pinaguinpinan", "Salong", "Tabugon", "Tagoc", "Talubangi", "Tampalon", "Tan-Awan", "Tapi"],
                "La Carlota City": ["Alegria", "Ara-al", "Ayungon", "Balabag", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Batuan", "Consuelo", "Cubay", "Haguimit", "La Granja", "Nagasi", "RSB", "San Miguel", "Yubo"],
                "La Castellana": ["Biaknabato", "Cabacungan", "Cabagnaan", "Camandag", "Iglaw-an", "Lalagsan", "Manghanoy", "Mansalanao", "Masulog", "Nato", "Poblacion", "Puso", "Sag-Ang", "Talaptap"],
                "Manapla": ["Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay II-A (Pob.)", "Burgos", "Chambery", "Makatunao", "Punta Mesa", "Punta Salong", "Purisima", "San Pablo", "Santa Teresa", "Tortosa"],
                "Moises Padilla": ["Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Barangay 6 (Pob.)", "Barangay 7 (Pob.)", "Crossing Magallon", "Guinpana-an", "Inolingan", "Macagahay", "Magallon Cadre", "Montilla", "Odoc", "Quintin Salas"],
                "Murcia": ["Abo-abo", "Alegria", "Amayco", "Aning", "Blumentritt", "Buenavista", "Caliban", "Canlandog", "Cansilayan", "Damsite", "Iglau-an", "Lopez Jaena", "Minoyan", "Pandanon", "San Miguel", "Santa Cruz", "Santa Rosa", "Zone I (Pob.)", "Zone II (Pob.)", "Zone III (Pob.)", "Zone IV (Pob.)", "Zone V (Pob.)"],
                "Pontevedra": ["Antipolo", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Buenavista", "Buenavista Rizal", "Burgos", "Cambarus", "Canroma", "Don Salvador Benedicto", "General Malvar", "Gomez", "M. H. Del Pilar", "Mabini", "Miranda", "Pandan", "Recreo", "San Isidro", "San Juan", "Zamora"],
                "Pulupandan": ["Culo", "Mabini", "Mabuhay", "Palaka Norte", "Palaka Sur", "Pating", "Tagda", "Tapadlan", "Ubay", "Zone 1", "Zone 1-A", "Zone 2", "Zone 3", "Zone 4", "Zone 4-A", "Zone 5", "Zone 6", "Zone 7"],
                "Sagay City": ["Andres Bonifacio", "Bato", "Baviera", "Bulanon", "Campo Himoga-an", "Colonia Divina", "Fabrica", "General Luna", "Himoga-an Baybay", "Lopez Jaena", "Malubon", "Maquiling", "Molocaboc", "Old Sagay", "Paraiso", "Plaridel", "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4", "Rizal", "Taba-ao", "Tadlong", "Vito"],
                "Salvador Benedicto": ["Bago", "Bunga", "Igwakang", "Kumaliskis", "Nayon", "Pandanon", "Pinowayan"],
                "San Carlos City": ["Bagonbon", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Barangay 6 (Pob.)", "Buluangan", "Codcod", "Ermita", "Guadalupe", "Nataban", "Palampas", "Prosperidad", "Punao", "Quezon", "Rizal", "San Juan"],
                "San Enrique": ["Bagonawa", "Baliwagan", "Batuan", "Guintorilan", "Nayom", "Poblacion", "Sibucao", "Tabao Baybay", "Tabao Rizal", "Tibsoc"],
                "Silay City": ["Bagtic", "Balaring", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Barangay V (Pob.)", "E. Lopez", "Guimbala-on", "Guinhalaran", "Hawaiian", "Kapitan Ramon", "Lantad", "Mambulac", "Patag", "Rizal"],
                "Sipalay City": ["Barangay 1 (Pob.)", "Barangay 2 (Pob.)", "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Cabadiangan", "Camindangan", "Canturay", "Cartagena", "Cayhawan", "Gil Montilla", "Mambaroto", "Manlucahoc", "Maricalum", "Nabulao", "Nauhang", "San Jose"],
                "Talisay City": ["Alegria", "Bubog", "Cabatangan", "Campuestohan", "Catabla", "Concepcion", "Dos Hermanas", "Efigenio Lizares", "Matab-ang", "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 4-A", "Zone 5", "Zone 6", "Zone 7", "Zone 8", "Zone 9", "Zone 10", "Zone 11", "Zone 12", "Zone 12-A", "Zone 14", "Zone 14-A", "Zone 14-B", "Zone 15"],
                "Toboso": ["Bandila", "Bug-ang", "General Luna", "Magticol", "Poblacion", "Ramon Benedicto", "San Isidro", "San Jose", "Tabun-ac"],
                "Valladolid": ["Alijis", "Ayungon", "Baghig", "Batuan", "Bayabas", "Central Tabao", "Doldol", "Guintorilan", "Lacaron", "Mabini", "Pacol", "Palaka", "Paloma", "Poblacion", "Sagua Banua", "Tabao Proper"],
                "Victorias City": ["Barangay I", "Barangay II", "Barangay III", "Barangay IV", "Barangay V", "Barangay VI", "Barangay VI-A", "Barangay VII", "Barangay VIII", "Barangay IX", "Barangay X", "Barangay XI", "Barangay XII", "Barangay XIII", "Barangay XIV", "Barangay XV", "Barangay XVI", "Barangay XVI-A", "Barangay XVII", "Barangay XVIII", "Barangay XVIII-A", "Barangay XIX", "Barangay XIX-A", "Barangay XX", "Barangay XXI"]
            },
            "Negros Oriental": {
                "Dumaguete City": ["Bagacay", "Bajumpandan", "Balugo", "Banilad", "Bantayan", "Batinguel", "Buñao", "Cadawinonan", "Calindagan", "Camanjac", "Candau-ay", "Cantil-e", "Daro", "Junob", "Looc", "Mangnao-Canal", "Motong", "Piapi", "Pulantubig", "Tabuctubig", "Taclobo", "Talay"],
                "Bais City": ["Basa", "Cabanlutan", "Calasga-an", "Cambagahan", "Cangmating", "Cansaloma", "Capinahan", "Consolacion", "Dansulan", "Dawis", "Hangyad", "La Paz", "Lo-oc", "Lonoy", "Mabunao", "Medalla Milagrosa", "Olympia", "Okiot", "Panalaan", "Panam-angan", "Poblacion", "Sab-ahan", "San Isidro", "Tagpo", "Talungon", "Tamisu"],
                "Bayawan City": ["Ali-is", "Banaybanay", "Bangkaya", "Boyco", "Bugay", "Cansumalig", "Dawis", "Kalamtukan", "Kalumboyan", "Malabugas", "Manduao", "Maninihon", "Minaba", "Nangka", "Narra", "Pagatban", "Poblacion", "San Jose", "San Miguel", "San Roque", "Suba", "Tayawan", "Villareal"],
                "Canlaon City": ["Aquino", "Binalbagan", "Bucamac", "Budlasan", "Linothangan", "Lumapao", "Mabigo", "Malaiba", "Masulog", "Ninoy Aquino", "Panca", "Panubigan"],
                "Guihulngan City": ["Bakid", "Balogo", "Banwague", "Basak", "Binobohan", "Buenavista", "Bulado", "Calamba", "Hilaitan", "Hinakpan", "Humaycol", "Imelda", "Kagawasan", "Linantuyan", "Luz", "Mabunga", "Magsaysay", "Malusay", "Maniak", "Mckinley", "Nagsaha", "Planas", "Poblacion", "Sandayao", "Tacpao", "Trinidad", "Tubod", "Villegas"],
                "Tanjay City": ["Azagra", "Bahi-an", "Luca", "Mancilang", "Novallas", "Obi", "Pal-ew", "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4", "Poblacion 5", "Poblacion 6", "Poblacion 7", "Poblacion 8", "Poblacion 9", "Polo", "San Isidro", "San Jose", "San Miguel", "Santa Cruz", "Santo Niño", "Tugas"]
            },
            "Siquijor": {
                "Siquijor (Capital)": ["Banban", "Bolos", "Caipilan", "Caitican", "Calalinan", "Canal", "Candanay Norte", "Candanay Sur", "Cang-adieng", "Cang-agong", "Cang-alwang", "Cang-asa", "Cang-atuyom", "Cang-inte", "Cang-isad", "Canghunoghunog", "Cangmatnog", "Cangmohao", "Cantabon", "Caticugan", "Dumanhog", "Ibabao", "Lambojon", "Luyang", "Luzong", "Olo", "Pangi", "Panlautan", "Pasihagon", "Pili", "Poblacion", "Polangyuta", "Ponong", "Sabang", "San Antonio", "Songculan", "Tacdog", "Tacloban", "Tambisan", "Tebjong", "Tinago", "Tongo"],
                "Larena": ["Bagacay", "Balolang", "Basac", "Bintangan", "Bontod", "Cabulihan", "Calunasan", "Candigum", "Cang-allas", "Cang-apa", "Cangbagsa", "Cangmalalag", "Canlambo", "Canlasog", "Catamboan", "Helen", "Nonoc", "North Poblacion", "Ponong", "Sabang", "Sandugan", "South Poblacion", "Taculing"],
                "Lazi": ["Campalanas", "Cangclaran", "Cangomantong", "Capalasanan", "Catamboan", "Gabayan", "Kimba", "Kinamandagan", "Lower Cabangcalan", "Nagerong", "Po-o", "Simacolong", "Tagmanocan", "Talayong", "Tigbawan", "Tignao", "Upper Cabangcalan", "Ytaya"],
                "Maria": ["Bogo", "Bonga", "Cabal-asan", "Calunasan", "Candaping A", "Candaping B", "Cantaroc A", "Cantaroc B", "Cantugbas", "Lico-an", "Lilo-an", "Logucan", "Looc", "Minalulan", "Nabutay", "Olang", "Pisong A", "Pisong B", "Poblacion Norte", "Poblacion Sur", "Saguing", "Sawang"],
                "San Juan": ["Canasagan", "Candura", "Cangmunag", "Cansayang", "Catulayan", "Lala-o", "Maite", "Napo", "Paliton", "Poblacion", "Solangon", "Tag-ibo", "Tambisan", "Timbaon", "Tubod"],
                "Enrique Villanueva": ["Balolong", "Bino-ongan", "Bitaug", "Bolot", "Camogao", "Cangmangki", "Libo", "Lomangcapan", "Lotloton", "Manan-ao", "Olave", "Parian", "Poblacion", "Tulapos"]
            }
        }

        total_prov = 0
        total_cities = 0
        total_brgys = 0

        for prov_name, cities in NIR_DATA.items():
            province, _ = Province.objects.get_or_create(name=prov_name)
            total_prov += 1
            
            for city_name, barangays in cities.items():
                city, _ = CityMunicipality.objects.get_or_create(name=city_name, province=province)
                total_cities += 1
                
                for brgy_name in barangays:
                    Barangay.objects.get_or_create(name=brgy_name, city=city)
                    total_brgys += 1

        self.stdout.write(self.style.SUCCESS(f'SUCCESS: Loaded {total_prov} Provinces, {total_cities} Cities, and {total_brgys} Barangays!'))