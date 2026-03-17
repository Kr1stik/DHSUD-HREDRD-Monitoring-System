import { useEffect, useState } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// 🌐 API CONFIGURATION
const API_URL = '/api/applications/';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = window.location.origin;

// --- ICON COMPONENTS ---
const NavDashboardIcon = () => (<svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const NavFolderIcon = () => (<svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>);
const NavArchiveIcon = () => (<svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>);
const NavAboutIcon = () => (<svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const HelpIcon = () => (<svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const EditIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const ArchiveIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>);
const RestoreIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>);
const TrashIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const SearchIcon = () => (<svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const BulkIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
const PrinterIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>);
const MenuIcon = () => (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>);
const CloseIcon = () => (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);

// --- CONSTANTS & INITIAL DATA ---
const initialOptions = {
  projTypes: ["OM Subd", "OM Condo", "MCH Subd", "MCH Condo", "EH Subd", "EH Condo", "SH Subd", "SH Condo", "MP", "COL/OS", "Commercial Condo", "Industrial Subd", "Commercial Subd", "Farmlot Subd"],
  appTypes: ["New Application", "Reactivated", "Replacement"],
  statusOptions: ["Ongoing", "Approved", "Denied", "Endorsed to HREDRB"],
  mainCompOptions: ["Main", "Compliance"],
  crlsOptions: ["New LS", "New CR", "Amended LS", "Amended CR", "Replacement of LS", "Replacement of CR", "Compliance Entry Only"]
};

const initialNirLocations: Record<string, Record<string, string[]>> = {
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
    "Hinoba-an": ["Alim", "Asia", "Bacuyangan", "Barangay I (Pob.)", "Barangay II (Pob.)", "Bulwangan", "Culasi", "Damutan", "Daug", "Pook", "San Rafael", "Sangke", "Talacagay"],
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
};

interface Application {
  id: number;
  name_of_proj: string;
  proj_owner_dev?: string; 
  status_of_application: string;
  type_of_application: string;
  cr_no: string;
  ls_no: string;
  proj_type: string;
  main_or_compliance: string;
  date_filed: string | null;
  date_issued: string | null;
  date_completion: string | null;
  prov: string;
  mun_city: string;
  street_brgy: string;
  crls_options?: string[];
  date_archived?: string | null;
}

// ==========================================
// 🚀 CONSOLIDATED PROJECT MODAL
// ==========================================
const ProjectFormModal = ({ 
  appToEdit, 
  onClose, 
  onSave, 
  showNotification, 
  requestConfirm,
  handleExport
}: { 
  appToEdit: Application | null, 
  onClose: () => void, 
  onSave: () => void,
  showNotification: any,
  requestConfirm: any,
  handleExport: (format: 'xlsx' | 'csv') => void
}) => {
  
  const [activeTab, setActiveTab] = useState<'form' | 'import'>(appToEdit ? 'form' : 'form');
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const emptyForm = {
    name_of_proj: '', proj_owner_dev: '', status_of_application: 'Ongoing', type_of_application: 'New Application', 
    cr_nos: [''], ls_nos: [''],
    proj_type: '', main_or_compliance: 'Main', date_filed: '', date_issued: '', date_completion: '', prov: '', mun_city: '', street_brgy: '', crls_options: [] as string[]
  };

  const [formData, setFormData] = useState(() => {
    if (appToEdit) {
      return {
        ...appToEdit,
        cr_nos: appToEdit.cr_no ? appToEdit.cr_no.split(', ') : [''],
        ls_nos: appToEdit.ls_no ? appToEdit.ls_no.split(', ') : ['']
      }
    }
    return emptyForm;
  });

  const [locationDB, setLocationDB] = useState<Record<string, Record<string, string[]>>>(() => {
    const saved = localStorage.getItem('dhsud_custom_locations');
    return saved ? JSON.parse(saved) : initialNirLocations;
  });

  const [formOptions, setFormOptions] = useState(() => {
    const saved = localStorage.getItem('dhsud_custom_options');
    return saved ? JSON.parse(saved) : initialOptions;
  });

  const [promptDialog, setPromptDialog] = useState({ show: false, title: '', message: '', placeholder: '', action: null as any });
  const [promptValue, setPromptValue] = useState('');

  useEffect(() => { localStorage.setItem('dhsud_custom_locations', JSON.stringify(locationDB)); }, [locationDB]);
  useEffect(() => { localStorage.setItem('dhsud_custom_options', JSON.stringify(formOptions)); }, [formOptions]);

  const availableProvinces = Object.keys(locationDB);
  const availableCities = formData.prov ? Object.keys(locationDB[formData.prov] || {}).sort() : [];
  const availableBarangays = (formData.prov && formData.mun_city) ? (locationDB[formData.prov][formData.mun_city] || []).sort() : [];

  const handleAddOption = (category: string, title: string) => {
    setPromptValue('');
    setPromptDialog({
      show: true, title: `Add ${title}`, message: `Add a new custom option for ${title}.`, placeholder: `e.g. New ${title}`,
      action: (newVal: string) => {
        if (newVal && newVal.trim() !== '') {
          const cleanVal = newVal.trim();
          if (!formOptions[category as keyof typeof formOptions].includes(cleanVal)) {
            setFormOptions((prev: any) => ({ ...prev, [category]: [...prev[category as keyof typeof formOptions], cleanVal] }));
            showNotification(`Added ${cleanVal}!`, "success");
          }
        }
      }
    });
  };

  const handleDeleteOption = (category: string, title: string, targetValue: string, formField: string) => {
    if (!targetValue) return;
    requestConfirm("Delete Option", `Are you sure you want to permanently delete '${targetValue}' from ${title} options?`, () => {
      setFormOptions((prev: any) => ({ ...prev, [category]: prev[category].filter((item: string) => item !== targetValue) }));
      if (formField) {
          if (formField === 'crls_options') {
              setFormData(prev => ({ ...prev, crls_options: (prev.crls_options || []).filter(item => item !== targetValue) }));
          } else if ((formData as any)[formField] === targetValue) {
              setFormData(prev => ({ ...prev, [formField]: '' }));
          }
      }
      showNotification(`Deleted ${targetValue}.`, "success");
    }, "Delete Option", "bg-red-600 hover:bg-red-700");
  };

  const handleAddLocation = (type: 'Province' | 'City' | 'Barangay') => {
    setPromptValue('');
    let title = type;
    let message = `Add a new ${type}.`;
    
    if (type === 'City' && !formData.prov) { showNotification("Select a Province first", "error"); return; }
    if (type === 'Barangay' && !formData.mun_city) { showNotification("Select a City first", "error"); return; }

    setPromptDialog({
      show: true, title: `Add ${title}`, message, placeholder: `Enter ${type} name`,
      action: (newVal: string) => {
        if (!newVal || newVal.trim() === '') return;
        const clean = newVal.trim();
        setLocationDB(prev => {
          const next = { ...prev };
          if (type === 'Province') { if (!next[clean]) next[clean] = {}; }
          else if (type === 'City') { if (!next[formData.prov][clean]) next[formData.prov][clean] = []; }
          else if (type === 'Barangay') { if (!next[formData.prov][formData.mun_city].includes(clean)) next[formData.prov][formData.mun_city].push(clean); }
          return next;
        });
        showNotification(`Added ${clean}`, "success");
      }
    });
  };

  const handleDeleteLocation = (type: 'Province' | 'City' | 'Barangay', value: string) => {
    if (!value) return;
    requestConfirm(`Delete ${type}`, `Permanently delete '${value}'?`, () => {
      setLocationDB(prev => {
        const next = { ...prev };
        if (type === 'Province') { delete next[value]; setFormData(p => ({...p, prov: '', mun_city: '', street_brgy: ''})); }
        else if (type === 'City') { delete next[formData.prov][value]; setFormData(p => ({...p, mun_city: '', street_brgy: ''})); }
        else if (type === 'Barangay') { next[formData.prov][formData.mun_city] = next[formData.prov][formData.mun_city].filter(b => b !== value); setFormData(p => ({...p, street_brgy: ''})); }
        return next;
      });
      showNotification(`Deleted ${value}`, "success");
    }, "Delete", "bg-red-600");
  };

  const handleArrayInput = (index: number, value: string, field: 'cr_nos' | 'ls_nos') => {
    const cleanValue = value.replace(/[^a-zA-Z0-9-\s]/g, ''); 
    setFormData(prev => {
      const newArr = [...prev[field]];
      newArr[index] = cleanValue;
      return { ...prev, [field]: newArr };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = { 
      ...formData,
      cr_no: formData.cr_nos.filter((v: string) => v.trim() !== '').join(', '),
      ls_no: formData.ls_nos.filter((v: string) => v.trim() !== '').join(', '),
      date_filed: formData.date_filed === '' ? null : formData.date_filed,
      date_issued: formData.date_issued === '' ? null : formData.date_issued,
      date_completion: formData.date_completion === '' ? null : formData.date_completion,
    }
    delete payload.cr_nos; delete payload.ls_nos;
    const apiCall = appToEdit ? axios.patch(`${API_URL}${appToEdit.id}/`, payload) : axios.post(API_URL, payload);
    apiCall.then(() => {
        showNotification(appToEdit ? "Project updated" : "Project created", "success");
        onSave();
      })
      .catch(() => showNotification("Action failed!", "error"));
  }

  const processImportFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'array' }); 
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

        if (jsonData.length === 0) {
          showNotification("Upload Failed: File is empty.", "error");
          return;
        }

        const validLocations = locationDB;
        const validData = [];

        for (const row of jsonData) {
          const prov = row['Prov']?.trim();
          const city = row['Mun/City']?.trim();
          
          if (validLocations[prov] && validLocations[prov][city]) {
            validData.push(row);
          }
        }

        if (validData.length === 0) {
          showNotification(`Import Blocked: All rows are outside NIR or invalid format.`, "error");
          return;
        }

        setPreviewData(validData);
        showNotification(`Preview Ready: ${validData.length} valid records found.`, "info");
      } catch (error) {
        showNotification("Critical Error: Ensure file is a valid .csv or .xlsx", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmBulkUpload = async () => {
    setIsUploading(true);
    const batchSize = 10;
    let successCount = 0;

    for (let i = 0; i < previewData.length; i += batchSize) {
      const batch = previewData.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(row => 
        axios.post(API_URL, {
          name_of_proj: row['Name of Proj'] || row['Project Name'] || 'Untitled',
          proj_owner_dev: row['Proj Owner Dev'] || '',
          proj_type: row['Proj Type'] || '',
          type_of_application: row['Type of Application'] || 'New Application',
          status_of_application: row['Status of Application'] || 'Ongoing',
          main_or_compliance: row['Main or Compliance'] || 'Main',
          prov: row['Prov'] || '',
          mun_city: row['Mun/City'] || '',
          street_brgy: row['Street/Brgy'] || '',
          cr_no: row['CR No.'] || '',
          ls_no: row['LS No.'] || '',
          crls_options: row['New or Amended CRLS'] ? String(row['New or Amended CRLS']).split(',').map(s => s.trim()) : []
        })
      )).then(results => {
        successCount += results.filter(r => r.status === 'fulfilled').length;
      });
    }

    setIsUploading(false);
    showNotification(`Successfully saved ${successCount} records!`, "success");
    onSave();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[100] animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-[24px] sm:rounded-[28px] shadow-2xl w-full max-w-5xl max-h-[96vh] sm:max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
          
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex flex-col gap-4 sm:gap-6 bg-white shadow-sm z-10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{appToEdit ? 'Update Project' : 'Project Management'}</h3>
                <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">{appToEdit ? 'Modify details for ' + appToEdit.name_of_proj : 'Manual entry or bulk data processing'}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-2xl transition-all">
                <CloseIcon />
              </button>
            </div>

            {!appToEdit && (
              <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button onClick={() => {setActiveTab('form'); setPreviewData([]);}} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Manual Entry</button>
                <button onClick={() => setActiveTab('import')} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Bulk Import / Export</button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent mt-4">
            {activeTab === 'form' ? (
              <form id="app-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Project Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Name *</label>
                      <input required className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.name_of_proj} onChange={e => setFormData({...formData, name_of_proj: e.target.value})} />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner / Developer</label>
                      <input className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.proj_owner_dev} onChange={e => setFormData({...formData, proj_owner_dev: e.target.value})} />
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Type</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('projTypes', 'Project Type')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.proj_type && <button type="button" onClick={() => handleDeleteOption('projTypes', 'Project Type', formData.proj_type, 'proj_type')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.proj_type} onChange={e => setFormData({...formData, proj_type: e.target.value})}>
                        <option value="" disabled>Select Type...</option>
                        {formOptions.projTypes.map((type: string) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Application Type</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('appTypes', 'Application Type')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.type_of_application && <button type="button" onClick={() => handleDeleteOption('appTypes', 'Application Type', formData.type_of_application, 'type_of_application')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.type_of_application} onChange={e => setFormData({...formData, type_of_application: e.target.value})}>
                        {formOptions.appTypes.map((type: string) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Status</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('statusOptions', 'Status')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.status_of_application && <button type="button" onClick={() => handleDeleteOption('statusOptions', 'Status', formData.status_of_application, 'status_of_application')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.status_of_application} onChange={e => setFormData({...formData, status_of_application: e.target.value})}>
                        <option value="" disabled>Select Status...</option>
                        {formOptions.statusOptions.map((status: string) => (<option key={status} value={status}>{status}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Main or Compliance</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('mainCompOptions', 'Category')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.main_or_compliance && <button type="button" onClick={() => handleDeleteOption('mainCompOptions', 'Category', formData.main_or_compliance, 'main_or_compliance')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.main_or_compliance} onChange={e => setFormData({...formData, main_or_compliance: e.target.value})}>
                        <option value="" disabled>Select Category...</option>
                        {formOptions.mainCompOptions.map((opt: string) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      Certifications
                    </h4>
                    <button type="button" onClick={() => handleAddOption('crlsOptions', 'Certification')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">+ Add Option</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {formOptions.crlsOptions.map((option: string) => (
                      <div key={option} className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-200 bg-slate-100 hover:border-blue-200 hover:bg-white transition-all group">
                        <label className="flex items-center space-x-3 cursor-pointer w-full">
                          <input type="checkbox" className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500" checked={formData.crls_options?.includes(option) || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setFormData(prev => ({
                                ...prev, crls_options: isChecked ? [...(prev.crls_options || []), option] : (prev.crls_options || []).filter(item => item !== option)
                              }));
                            }}
                          />
                          <span className="text-slate-700 font-bold text-sm">{option}</span>
                        </label>
                        <button type="button" onClick={() => handleDeleteOption('crlsOptions', 'Certification', option, 'crls_options')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− (Del)</button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CR No.</label>
                        <button type="button" onClick={() => setFormData(p => ({...p, cr_nos: [...p.cr_nos, '']}))} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+ Add New</button>
                      </div>
                      {formData.cr_nos.map((val: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={val} onChange={(e) => handleArrayInput(i, e.target.value, 'cr_nos')} />
                          {formData.cr_nos.length > 1 && <button type="button" onClick={() => setFormData(p => ({...p, cr_nos: p.cr_nos.filter((_, idx) => idx !== i)}))} className="text-red-500 px-3 hover:bg-red-50 rounded-xl transition-colors font-black">−</button>}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LS No.</label>
                        <button type="button" onClick={() => setFormData(p => ({...p, ls_nos: [...p.ls_nos, '']}))} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+ Add New</button>
                      </div>
                      {formData.ls_nos.map((val: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={val} onChange={(e) => handleArrayInput(i, e.target.value, 'ls_nos')} />
                          {formData.ls_nos.length > 1 && <button type="button" onClick={() => setFormData(p => ({...p, ls_nos: p.ls_nos.filter((_, idx) => idx !== i)}))} className="text-red-500 px-3 hover:bg-red-50 rounded-xl transition-colors font-black">−</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Location Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Province</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddLocation('Province')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.prov && <button type="button" onClick={() => handleDeleteLocation('Province', formData.prov)} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select required className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.prov} onChange={e => setFormData({...formData, prov: e.target.value, mun_city: '', street_brgy: ''})}>
                        <option value="" disabled>Select Province...</option>
                        {availableProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Municipality / City</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddLocation('City')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.mun_city && <button type="button" onClick={() => handleDeleteLocation('City', formData.mun_city)} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select required disabled={!formData.prov} className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50 text-slate-700" value={formData.mun_city} onChange={e => setFormData({...formData, mun_city: e.target.value, street_brgy: ''})}>
                        <option value="" disabled>Select City/Mun...</option>
                        {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Barangay</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddLocation('Barangay')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.street_brgy && <button type="button" onClick={() => handleDeleteLocation('Barangay', formData.street_brgy)} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select required disabled={!formData.mun_city} className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50 text-slate-700" value={formData.street_brgy} onChange={e => setFormData({...formData, street_brgy: e.target.value})}>
                        <option value="" disabled>Select Barangay...</option>
                        {availableBarangays.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Timelines
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Filed</label>
                      <input type="date" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.date_filed || ''} onChange={e => setFormData({...formData, date_filed: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Issued</label>
                      <input type="date" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.date_issued || ''} onChange={e => setFormData({...formData, date_issued: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Completion</label>
                      <input type="date" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.date_completion || ''} onChange={e => setFormData({...formData, date_completion: e.target.value})} />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-8 py-4 animate-in slide-in-from-bottom-4 duration-300">
                {previewData.length > 0 ? (
                  <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[65vh]">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-slate-800">Preview Data</h4>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">Found <span className="text-emerald-600 font-bold">{previewData.length} valid</span> records.</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setPreviewData([])} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-xl font-bold text-sm" disabled={isUploading}>Cancel</button>
                        <button onClick={confirmBulkUpload} disabled={isUploading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-sm">
                          {isUploading ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 font-bold text-slate-600 border-b">Project Name</th>
                            <th className="px-4 py-2 font-bold text-slate-600 border-b">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewData.slice(0, 50).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-800">{row['Name of Proj'] || 'Untitled'}</td>
                              <td className="px-4 py-2 text-slate-600">{row['Mun/City']}, {row['Prov']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                      className={`relative group h-[40vh] border-4 border-dashed rounded-[32px] transition-all flex flex-col items-center justify-center gap-5 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.xlsx" onChange={(e) => { if(e.target.files && e.target.files[0]) processImportFile(e.target.files[0]); }} />
                      <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center transition-all ${isDragging ? 'bg-blue-500 text-white scale-110 shadow-xl' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500'}`}>
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-slate-800">Upload Database</p>
                        <p className="text-slate-500 font-medium text-sm mt-2">Drag and drop .csv or .xlsx file here</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => { handleExport('csv'); onClose(); }} className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group shadow-sm">
                        <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="font-black text-slate-800">Export as CSV</span>
                      </button>
                      <button onClick={() => { handleExport('xlsx'); onClose(); }} className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group shadow-sm">
                        <svg className="w-8 h-8 mb-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="font-black text-slate-800">Export as Excel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {activeTab === 'form' && (
            <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-slate-200 bg-white flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={onClose} className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold transition-colors text-sm sm:text-base">Discard</button>
              <button type="submit" form="app-form" className="px-8 py-3 sm:px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm sm:text-base">
                {appToEdit ? 'Save Changes' : 'Confirm Entry'}
              </button>
            </div>
          )}
        </div>
      </div>

      {promptDialog.show && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[120]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95">
             <h3 className="text-xl font-black text-slate-800 text-center mb-6">{promptDialog.title}</h3>
             <input autoFocus className="w-full mb-6 border-2 border-slate-100 rounded-2xl px-5 py-4 bg-slate-50 font-bold outline-none focus:border-blue-500" value={promptValue} onChange={(e) => setPromptValue(e.target.value)} />
             <button onClick={() => { promptDialog.action?.(promptValue); setPromptDialog({ ...promptDialog, show: false }); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Save</button>
          </div>
        </div>
      )}
    </>
  )
}

// ==========================================
// 🚀 PRINT REPORT MODAL
// ==========================================
const PrintReportModal = ({ data, onClose }: { data: Application[], onClose: () => void }) => {
  const stats = {
    approved: data.filter(a => a.status_of_application === 'Approved').length,
    ongoing: data.filter(a => a.status_of_application === 'Ongoing').length,
    endorsed: data.filter(a => a.status_of_application === 'Endorsed to HREDRB').length,
    denied: data.filter(a => a.status_of_application === 'Denied').length,
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] overflow-y-auto p-8 print:absolute print:inset-0 print:bg-white print:z-[9999] print:block">
      <style>{'@media print { @page { margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }'}</style>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8 print:hidden">
          <button onClick={onClose} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Close Preview</button>
          <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <PrinterIcon />
            Print Document
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8 border-b-4 border-slate-900 pb-6">
          <img src="/static/trackerApp/DHSUD_LOGO.png" alt="Logo" className="w-20 h-20 object-contain" />
          <div className="text-center">
            <h2 className="text-xl font-black uppercase text-slate-800 leading-tight">Republic of the Philippines</h2>
            <h1 className="text-2xl font-black uppercase text-slate-900 leading-tight">Department of Human Settlements and Urban Development</h1>
            <h3 className="text-lg font-bold text-slate-600">Negros Island Region (NIR)</h3>
          </div>
        </div>

        <div className="text-center mb-10">
          <h4 className="text-2xl font-black text-slate-900 pt-2 underline decoration-4 underline-offset-8">Project Status & Accomplishment Report</h4>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-4">Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-10">
          {Object.entries(stats).map(([label, count]) => (
            <div key={label} className="border-2 border-slate-900 p-4 rounded-2xl text-center bg-slate-50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-black text-slate-900">{count}</p>
            </div>
          ))}
        </div>

        <table className="w-full text-[11px] border-collapse border-2 border-slate-900">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Project Name</th>
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Location</th>
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Category</th>
              <th className="border border-slate-900 px-3 py-3 text-left font-black uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((app, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-300 px-3 py-2 font-black text-slate-900">{app.name_of_proj}</td>
                <td className="border border-slate-300 px-3 py-2 font-bold text-slate-700">{app.mun_city}, {app.prov}</td>
                <td className="border border-slate-300 px-3 py-2 font-bold text-slate-600">{app.main_or_compliance}</td>
                <td className="border border-slate-300 px-3 py-2 font-black text-slate-900">{app.status_of_application}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-16 grid grid-cols-2 gap-20">
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-12">Prepared By:</p>
              <div className="h-px bg-slate-900 w-64 mx-auto mb-1"></div>
              <p className="text-xs font-black uppercase text-slate-900">Administrative Officer / Staff</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">HREDRD NIR</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-12">Approved By:</p>
              <div className="h-px bg-slate-900 w-64 mx-auto mb-1"></div>
              <p className="text-xs font-black uppercase text-slate-900">Regional Director</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">DHSUD NIR</p>
           </div>
        </div>

        <div className="mt-20 border-t border-slate-200 pt-4 hidden print:block">
           <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span>DHSUD-NIR-HREDRD-v1.0</span>
              <span>Generated via Monitoring System | {new Date().toLocaleString()}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'dashboard' | 'active' | 'archive' | 'about'>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showHelp, setShowHelp] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [viewingApp, setViewingApp] = useState<Application | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean; title: string; message: string; action: (() => void) | null; confirmText: string; confirmColor: string;
  }>({
    show: false, title: '', message: '', action: null, confirmText: 'Confirm', confirmColor: 'bg-blue-600'
  })

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  }

  const requestConfirm = (title: string, message: string, action: () => void, confirmText: string, confirmColor: string) => {
    setConfirmDialog({ show: true, title, message, action, confirmText, confirmColor });
  }

  const fetchApplications = (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    axios.get(API_URL)
      .then(response => {
        const data = response.data.results || response.data;
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setApplications([]);
        showNotification("Failed to load projects from server.", "error");
      })
      .finally(() => { if (!silent) setIsLoading(false); });
  }

  useEffect(() => { fetchApplications() }, [])

  useEffect(() => {
    setSelectedIds([]);
    setIsBulkMode(false);
    setCurrentPage(1); 
    setIsSidebarOpen(false); // Close sidebar on view change (mobile)
  }, [currentView, searchTerm]);

  const appsArray = Array.isArray(applications) ? applications : [];
  const activeApps = appsArray.filter(app => app.status_of_application !== 'Archived')
  const archivedApps = appsArray.filter(app => app.status_of_application === 'Archived')
  const displayApps = currentView === 'active' ? activeApps : archivedApps

  const stats = {
    ongoing: activeApps.filter(a => a.status_of_application === 'Ongoing').length,
    approved: activeApps.filter(a => a.status_of_application === 'Approved').length,
    denied: activeApps.filter(a => a.status_of_application === 'Denied').length,
    endorsed: activeApps.filter(a => a.status_of_application === 'Endorsed to HREDRB').length,
  }

  const chartData = [
    { name: 'Ongoing', count: stats.ongoing, color: '#3b82f6' },
    { name: 'Approved', count: stats.approved, color: '#10b981' },
    { name: 'Endorsed', count: stats.endorsed, color: '#f59e0b' },
    { name: 'Denied', count: stats.denied, color: '#ef4444' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#ef4444'];
  
  const projTypeCounts = activeApps.reduce((acc, app) => {
    const type = app.proj_type || 'Unspecified';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartDataRaw = Object.keys(projTypeCounts)
    .map((key) => ({ name: key, value: projTypeCounts[key] }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const top5 = pieChartDataRaw.slice(0, 5);
  const others = pieChartDataRaw.slice(5);
  const pieChartData = [...top5];
  if (others.length > 0) {
    const othersCount = others.reduce((acc, curr) => acc + curr.value, 0);
    pieChartData.push({ name: 'Others', value: othersCount });
  }

  const filteredApps = displayApps.filter(app => {
    return app.name_of_proj.toLowerCase().includes(searchTerm.toLowerCase()) || 
           app.mun_city.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedApps = [...filteredApps].sort((a, b) => b.id - a.id); 
  const totalPages = Math.ceil(sortedApps.length / itemsPerPage);
  const paginatedApps = sortedApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(paginatedApps.map(app => app.id));
    else setSelectedIds([]);
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleExport = (format: 'xlsx' | 'csv') => {
    const dataToExport = sortedApps.map(app => ({
      'Type of Application': app.type_of_application || '', 'Status of Application': app.status_of_application || '', 'New or Amended CRLS': app.crls_options?.join(', ') || '', 'Main or Compliance': app.main_or_compliance || '', 'Date Filed': app.date_filed || '', 'Date Issued': app.date_issued || '', 'Date Completion': app.date_completion || '', 'CR No.': app.cr_no || '', 'LS No.': app.ls_no || '', 'Name of Proj': app.name_of_proj || '', 'Proj Owner Dev': app.proj_owner_dev || '', 'Prov': app.prov || '', 'Mun/City': app.mun_city || '', 'Street/Brgy': app.street_brgy || '', 'Proj Type': app.proj_type || ''
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, `DHSUD_Export.${format}`);
    showNotification(`Exported as ${format.toUpperCase()}!`, "success");
  };

  const handleSoftDelete = (id: number) => {
    requestConfirm("Archive Project", "Move this project to archives?", () => {
      axios.patch(`${API_URL}${id}/`, { status_of_application: 'Archived', date_archived: new Date().toISOString() })
        .then(() => { fetchApplications(true); showNotification("Archived.", "success"); })
        .catch(() => showNotification("Failed.", "error"));
    }, "Archive", "bg-orange-500");
  }

  const handleRestore = (id: number) => {
    requestConfirm("Restore Project", "Move back to active list?", () => {
      axios.patch(`${API_URL}${id}/`, { status_of_application: 'Ongoing', date_archived: null })
        .then(() => { fetchApplications(true); showNotification("Restored.", "success"); })
        .catch(() => showNotification("Failed.", "error"));
    }, "Restore", "bg-emerald-600");
  }

  const handleHardDelete = (id: number) => {
    requestConfirm("Permanent Deletion", "This cannot be undone. Delete forever?", () => {
      axios.delete(`${API_URL}${id}/`)
        .then(() => { fetchApplications(true); showNotification("Deleted.", "success"); })
        .catch(() => showNotification("Failed.", "error"));
    }, "Delete", "bg-red-600");
  }

  const getStatusBadge = (status: string) => {
    let dotColor = 'bg-blue-500';
    if (status === 'Approved') dotColor = 'bg-emerald-500';
    if (status === 'Denied') dotColor = 'bg-red-500';
    if (status === 'Endorsed to HREDRB') dotColor = 'bg-amber-500';
    if (status === 'Archived') dotColor = 'bg-slate-400';
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${dotColor}`}></div>
        <span className="font-bold text-slate-700">{status}</span>
      </div>
    );
  };

  const [showChartModal, setShowChartModal] = useState<{show: boolean, title: string, data: any[]}>({show: false, title: '', data: []});

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-slate-900 text-white px-4 flex justify-between items-center z-[50] shadow-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/static/trackerApp/DHSUD_LOGO.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="font-black tracking-tight truncate text-lg">
            {currentView === 'active' ? 'Projects' : currentView === 'archive' ? 'Archives' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg shrink-0">
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* TOAST NOTIFICATIONS ... */}
      {toast.show && (
        <div className="fixed top-20 md:top-8 right-4 md:right-8 z-[150] min-w-[280px] sm:min-w-[320px] max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-8 fade-in">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {toast.type === 'success' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6" /></svg>}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-bold text-slate-800">{toast.type === 'success' ? 'Success' : 'Notice'}</p>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full shadow-2xl z-[60] transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <img src="/static/trackerApp/DHSUD_LOGO.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
          <div className="overflow-hidden">
            <h2 className="text-[10px] font-bold text-white uppercase tracking-widest leading-relaxed whitespace-normal">Housing and Real Estate Development Regulation Division</h2>
            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider truncate">Negros Island Region</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overview</p>
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <NavDashboardIcon /> Dashboard
          </button>
          <button onClick={() => setCurrentView('active')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'active' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <NavFolderIcon /> Projects
          </button>
          
          <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Management</p>
          <button onClick={() => setCurrentView('archive')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'archive' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <NavArchiveIcon /> Archives
          </button>
          
          <p className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System & Info</p>
          <button onClick={() => setCurrentView('about')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentView === 'about' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <NavAboutIcon /> About
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 mt-auto">
          <button onClick={() => setShowHelp(true)} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <HelpIcon /> Help Guide
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 p-4 sm:p-8 md:ml-64 mt-16 md:mt-0 transition-all duration-300 flex flex-col`}>
        <div className="max-w-6xl mx-auto w-full">
          
          {currentView === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <h1 className="text-2xl font-bold text-slate-800">Analytics Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {[
                  { label: 'Ongoing', val: stats.ongoing, color: 'blue' },
                  { label: 'Approved', val: stats.approved, color: 'emerald' },
                  { label: 'Endorsed', val: stats.endorsed, color: 'amber' },
                  { label: 'Denied', val: stats.denied, color: 'red' }
                ].map(s => (
                  <div key={s.label} className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-${s.color}-500`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <p className="text-2xl sm:text-4xl font-bold text-slate-800 mt-1">{s.val}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Status Breakdown</h3>
                    <button onClick={() => setShowChartModal({show: true, title: 'Application Status Breakdown', data: chartData})} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Full Report</button>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
                          {chartData.map((d, i) => (<Cell key={i} fill={d.color} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Project Types</h3>
                    <button onClick={() => setShowChartModal({show: true, title: 'All Project Types', data: pieChartDataRaw})} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Full Report</button>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                          {pieChartData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(v) => <span className="text-xs font-medium text-slate-600">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(currentView === 'active' || currentView === 'archive') && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">{currentView === 'active' ? 'Project Registry' : 'Archives'}</h1>
                <div className="flex items-center gap-2">
                   <button onClick={() => setIsBulkMode(!isBulkMode)} className={`p-2.5 rounded-xl border transition-all ${isBulkMode ? 'bg-slate-800 text-white' : 'bg-white border-slate-300 text-slate-600'}`}><BulkIcon /></button>
                   <button onClick={() => setShowReport(true)} className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-all"><PrinterIcon /></button>
                   {currentView === 'active' && (
                     <button onClick={() => { setEditingApp(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base">+ New Project</button>
                   )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-4 flex items-center"><SearchIcon /></span>
                  <input type="text" placeholder="Search projects..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full max-w-full">
                <table className="w-full md:min-w-[900px] text-left border-separate border-spacing-0">
                  <thead className="hidden md:table-header-group">
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {isBulkMode && <th className="px-6 py-4 w-12 border-b border-slate-200"><input type="checkbox" checked={paginatedApps.length > 0 && paginatedApps.every(a => selectedIds.includes(a.id))} onChange={handleSelectAll} /></th>}
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Project Info</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Location</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">Certifications</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right border-b border-slate-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="flex flex-col md:table-row-group divide-y divide-slate-100">
                    {isLoading ? (
                      <tr><td colSpan={6} className="px-6 py-20 text-center animate-pulse font-bold text-slate-400">Loading records...</td></tr>
                    ) : paginatedApps.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-20 text-center font-bold text-slate-400">No results found.</td></tr>
                    ) : (
                      paginatedApps.map(app => (
                        <tr key={app.id} className="flex flex-col relative py-5 px-1 gap-1 md:table-row md:py-0 md:px-0 md:gap-0 md:hover:bg-slate-50 transition-colors group">
                          {isBulkMode && <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5"><input type="checkbox" checked={selectedIds.includes(app.id)} onChange={() => handleSelectRow(app.id)} /></td>}
                          <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                            <button onClick={() => setViewingApp(app)} className="font-bold text-blue-600 text-lg hover:underline text-left block truncate max-w-[calc(100%-100px)] md:max-w-xs">{app.name_of_proj}</button>
                            <span className="text-xs font-medium text-slate-400 mt-1 block uppercase tracking-tight">{app.proj_type}</span>
                          </td>
                          <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                            <p className="font-medium text-slate-700">{app.mun_city}</p>
                            <p className="text-xs font-medium text-slate-400">{app.prov}</p>
                          </td>
                          <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                            {getStatusBadge(app.status_of_application)}
                          </td>
                          <td className="block md:table-cell px-2 py-1 md:px-6 md:py-5">
                            <div className="flex flex-col gap-1">
                                {app.cr_no && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit">CR: {app.cr_no}</span>}
                                {app.ls_no && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">LS: {app.ls_no}</span>}
                                {(!app.cr_no && !app.ls_no) && <span className="text-xs text-slate-300 italic font-medium">None</span>}
                            </div>
                          </td>
                          <td className="absolute top-4 right-2 flex gap-1 bg-transparent md:relative md:top-auto md:right-auto md:table-cell md:px-6 md:py-5">
                            <div className="flex justify-end gap-1">
                              {currentView === 'active' ? (
                                <>
                                  <button onClick={() => {setEditingApp(app); setIsModalOpen(true);}} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><EditIcon /></button>
                                  <button onClick={() => handleSoftDelete(app.id)} className="p-2 text-slate-400 hover:text-orange-600 transition-colors"><ArchiveIcon /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleRestore(app.id)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><RestoreIcon /></button>
                                  <button onClick={() => handleHardDelete(app.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><TrashIcon /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 border rounded-xl disabled:opacity-30 font-bold text-sm">Prev</button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 border rounded-xl disabled:opacity-30 font-bold text-sm">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'about' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8 animate-in fade-in">
              <h1 className="text-3xl font-black text-slate-800">About System</h1>
              <div className="space-y-4 text-slate-500 leading-relaxed text-lg">
                <p>The Housing and Real Estate Development Regulation Division (HREDRD) Monitoring System is a dedicated digital platform designed to streamline the tracking and management of project applications, Certificates of Registration (CR), and Licenses to Sell (LS).</p>
                <p>Purpose-built for the Negros Island Region, the system ensures local data integrity and provides real-time analytics for regional administrators to monitor the progress of housing developments and compliance entries.</p>
                <p>The architecture leverages an offline-first, local area network (LAN) approach, allowing multiple employees to access and update records simultaneously without requiring a public internet connection, ensuring maximum security and speed for office operations.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Lead Developer</p>
                   <h3 className="text-2xl font-black text-slate-800 mb-4">Wenard Roy Barrera</h3>
                   <a href="https://kr1stik.cosedevs.com/" target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-black text-sm hover:gap-3 transition-all">
                      View Portfolio
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                   </a>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Support</p>
                   <h3 className="text-xl font-black text-slate-800">John Eric Bayer</h3>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Support</p>
                   <h3 className="text-xl font-black text-slate-800">Jefferson Inere</h3>
                </div>
              </div>
            </div>
          )}
        </div>
        <footer className="mt-auto py-6 text-center text-slate-400 font-bold text-xs tracking-widest uppercase">DHSUD | {new Date().getFullYear()}</footer>
      </main>

      {/* VIEW DETAILS MODAL */}
      {viewingApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">{viewingApp.name_of_proj}</h2>
                <button onClick={() => setViewingApp(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><CloseIcon /></button>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner / Developer</p>
                      <p className="font-medium text-slate-700">{viewingApp.proj_owner_dev || 'Not Specified'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                      <p className="font-medium text-slate-700">{viewingApp.proj_type || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        {getStatusBadge(viewingApp.status_of_application)}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                        <p className="font-medium text-slate-700">{viewingApp.main_or_compliance}</p>
                    </div>
                 </div>

                 <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Credentials & Certifications</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-mono font-medium text-blue-700">CR: {viewingApp.cr_no || 'None'}</p>
                            <p className="font-mono font-medium text-blue-700 mt-1">LS: {viewingApp.ls_no || 'None'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Options</p>
                            <div className="flex flex-wrap gap-1">
                                {viewingApp.crls_options && viewingApp.crls_options.length > 0 ? (
                                    viewingApp.crls_options.map((opt, i) => (
                                        <span key={i} className="px-2 py-1 bg-white rounded-md text-xs font-bold text-blue-700 shadow-sm border border-blue-100">{opt}</span>
                                    ))
                                ) : (
                                    <span className="text-xs font-medium text-blue-400 italic">None selected</span>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="p-5 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Important Timeline</p>
                    <div className={`grid grid-cols-1 ${viewingApp.status_of_application === 'Archived' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Filed</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_filed ? new Date(viewingApp.date_filed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_issued ? new Date(viewingApp.date_issued).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Completion</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_completion ? new Date(viewingApp.date_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                        </div>
                        {viewingApp.status_of_application === 'Archived' && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Archived</p>
                            <p className="font-medium text-slate-700">{viewingApp.date_archived ? new Date(viewingApp.date_archived).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '---'}</p>
                          </div>
                        )}
                    </div>
                 </div>

                 <div className="p-5 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Address</p>
                    <p className="font-medium text-slate-700 leading-relaxed">{viewingApp.street_brgy}, {viewingApp.mun_city}, {viewingApp.prov}</p>
                 </div>
              </div>
              <button onClick={() => setViewingApp(null)} className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[130]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-800 text-center mb-3">{confirmDialog.title}</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">{confirmDialog.message}</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { confirmDialog.action?.(); setConfirmDialog({ ...confirmDialog, show: false }); }} className={`w-full py-3.5 text-white rounded-xl font-black ${confirmDialog.confirmColor}`}>{confirmDialog.confirmText}</button>
              <button onClick={() => setConfirmDialog({ ...confirmDialog, show: false })} className="w-full py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT FORM MODAL */}
      {isModalOpen && (
        <ProjectFormModal 
          appToEdit={editingApp} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { fetchApplications(); setIsModalOpen(false); }}
          showNotification={showNotification}
          requestConfirm={requestConfirm}
          handleExport={handleExport}
        />
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[130]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-800 mb-4">Quick Guide</h3>
            <div className="space-y-4 text-slate-600 font-medium">
              <p>• <strong className="text-slate-800">Dashboard:</strong> Real-time charts of all active projects.</p>
              <p>• <strong className="text-slate-800">Projects:</strong> View and manage all your active registration applications.</p>
              <p>• <strong className="text-slate-800">Import/Export:</strong> Use the Bulk Import tab in the "+ New Project" modal to upload CSV/Excel files.</p>
              <p>• <strong className="text-slate-800">Archives:</strong> Store old projects. They can be restored or permanently deleted at any time.</p>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black">Got it</button>
          </div>
        </div>
      )}

      {/* CHART FULL REPORT MODAL */}
      {showChartModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{showChartModal.title}</h3>
              <button onClick={() => setShowChartModal({show: false, title: '', data: []})} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {showChartModal.data.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <span className="bg-white px-3 py-1 rounded-lg font-black text-blue-600 shadow-sm border border-slate-200">{item.count || item.value}</span>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setShowChartModal({show: false, title: '', data: []})} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT REPORT MODAL */}
      {showReport && (
        <PrintReportModal 
          data={filteredApps} 
          onClose={() => setShowReport(false)} 
        />
      )}

    </div>
  )
}