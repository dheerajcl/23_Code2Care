import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, Check, ChevronDownIcon, ChevronRight, HelpCircle, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { registerVolunteer } from '@/services/auth.service';
import { useAuth } from '@/lib/authContext';
import LandingHeader from '@/components/LandingHeader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Dropdown } from 'react-day-picker';


const stateCityMap: { [key: string]: string[] } = {
  "andaman_nicobar": [
    "Nicobar",
    "North and Middle Andaman",
    "South Andaman"
  ],
  "andhra_pradesh": [
    "Anantapur",
    "Chittoor",
    "East Godavari",
    "Guntur",
    "Kadapa",
    "Krishna",
    "Kurnool",
    "Nellore",
    "Prakasam",
    "Srikakulam",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari"
  ],
  "arunachal_pradesh": [
    "Anjaw",
    "Changlang",
    "Dibang Valley",
    "East Kameng",
    "East Siang",
    "Kamle",
    "Kra Daadi",
    "Kurung Kumey",
    "Lepa Rada",
    "Lohit",
    "Longding",
    "Lower Dibang Valley",
    "Lower Siang",
    "Lower Subansiri",
    "Namsai",
    "Pakke-Kessang",
    "Papum Pare",
    "Shi Yomi",
    "Siang",
    "Tawang",
    "Tirap",
    "Upper Siang",
    "Upper Subansiri",
    "West Kameng",
    "West Siang"
  ],
  "assam": [
    "Baksa",
    "Barpeta",
    "Biswanath",
    "Bongaigaon",
    "Cachar",
    "Charaideo",
    "Chirang",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Dima Hasao",
    "Goalpara",
    "Golaghat",
    "Hailakandi",
    "Hojai",
    "Jorhat",
    "Kamrup",
    "Kamrup Metropolitan",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Majuli",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Sivasagar",
    "Sonitpur",
    "South Salmara-Mankachar",
    "Tinsukia",
    "Udalguri",
    "West Karbi Anglong"
  ],
  "bihar": [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran"
  ],
  "chandigarh": [
    "Chandigarh"
  ],
  "chhattisgarh": [
    "Balod",
    "Baloda Bazar",
    "Balrampur",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Gariaband",
    "Janjgir-Champa",
    "Jashpur",
    "Kabirdham",
    "Kanker",
    "Kondagaon",
    "Korba",
    "Koriya",
    "Mahasamund",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sukma",
    "Surajpur",
    "Surguja"
  ],
  "dadra_nagar_haveli_daman_diu": [
    "Dadra and Nagar Haveli",
    "Daman",
    "Diu"
  ],
  "delhi": [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi"
  ],
  "goa": [
    "North Goa",
    "South Goa"
  ],
  "gujarat": [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhoomi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panchmahal",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad"
  ],
  "haryana": [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurugram",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Nuh",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar"
  ],
  "himachal_pradesh": [
    "Bilaspur",
    "Chamba",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Kullu",
    "Lahaul and Spiti",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Solan",
    "Una"
  ],
  "jammu_kashmir": [
    "Anantnag",
    "Bandipora",
    "Baramulla",
    "Budgam",
    "Doda",
    "Ganderbal",
    "Jammu",
    "Kathua",
    "Kishtwar",
    "Kulgam",
    "Kupwara",
    "Poonch",
    "Pulwama",
    "Rajouri",
    "Ramban",
    "Reasi",
    "Samba",
    "Shopian",
    "Srinagar",
    "Udhampur"
  ],
  "jharkhand": [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahibganj",
    "Seraikela-Kharsawan",
    "Simdega",
    "West Singhbhum"
  ],
  "karnataka": [
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikballapur",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Ramanagara",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayanagara",
    "Vijayapura",
    "Yadgir"
  ],
  "kerala": [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad"
  ],
  "ladakh": [
    "Kargil",
    "Leh"
  ],
  "lakshadweep": [
    "Lakshadweep"
  ],
  "madhya_pradesh": [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Hoshangabad",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa",
    "Khargone",
    "Mandla",
    "Mandsaur",
    "Morena",
    "Narsinghpur",
    "Neemuch",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha"
  ],
  "maharashtra": [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal"
  ],
  "manipur": [
    "Bishnupur",
    "Chandel",
    "Churachandpur",
    "Imphal East",
    "Imphal West",
    "Jiribam",
    "Kakching",
    "Kamjong",
    "Kangpokpi",
    "Noney",
    "Pherzawl",
    "Senapati",
    "Tamenglong",
    "Tengnoupal",
    "Thoubal",
    "Ukhrul"
  ],
  "meghalaya": [
    "East Garo Hills",
    "East Jaintia Hills",
    "East Khasi Hills",
    "North Garo Hills",
    "Ri-Bhoi",
    "South Garo Hills",
    "South West Garo Hills",
    "South West Khasi Hills",
    "West Garo Hills",
    "West Jaintia Hills",
    "West Khasi Hills"
  ],
  "mizoram": [
    "Aizawl",
    "Champhai",
    "Hnahthial",
    "Khawzawl",
    "Kolasib",
    "Lawngtlai",
    "Lunglei",
    "Mamit",
    "Saiha",
    "Saitual",
    "Serchhip"
  ],
  "nagaland": [
    "Chümoukedima",
    "Dimapur",
    "Kiphire",
    "Kohima",
    "Longleng",
    "Mokokchung",
    "Mon",
    "Niuland",
    "Noklak",
    "Peren",
    "Phek",
    "Shamator",
    "Tseminyu",
    "Tuensang",
    "Wokha",
    "Zünheboto"
  ],
  "odisha": [
    "Angul",
    "Balangir",
    "Balasore",
    "Bargarh",
    "Bhadrak",
    "Boudh",
    "Cuttack",
    "Deogarh",
    "Dhenkanal",
    "Gajapati",
    "Ganjam",
    "Jagatsinghpur",
    "Jajpur",
    "Jharsuguda",
    "Kalahandi",
    "Kandhamal",
    "Kendrapara",
    "Kendujhar",
    "Khordha",
    "Koraput",
    "Malkangiri",
    "Mayurbhanj",
    "Nabarangpur",
    "Nayagarh",
    "Nuapada",
    "Puri",
    "Rayagada",
    "Sambalpur",
    "Subarnapur",
    "Sundargarh"
  ],
  "puducherry": [
    "Karaikal",
    "Mahe",
    "Puducherry",
    "Yanam"
  ],
  "punjab": [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Mansa",
    "Moga",
    "Muktsar",
    "Nawanshahr",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "Sangrur",
    "SAS Nagar",
    "Tarn Taran"
  ],
  "rajasthan": [
    "Ajmer",
    "Alwar",
    "Banswara",
    "Baran",
    "Barmer",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Dholpur",
    "Dungarpur",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalore",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Kota",
    "Nagaur",
    "Pali",
    "Pratapgarh",
    "Rajsamand",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur"
  ],
  "sikkim": [
    "East Sikkim",
    "North Sikkim",
    "South Sikkim",
    "West Sikkim"
  ],
  "tamil_nadu": [
    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kancheepuram",
    "Kanniyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar"
  ],  "telangana": [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalpally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Kumuram Bheem Asifabad",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal-Malkajgiri",
    "Mulugu",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal Rural",
    "Warangal Urban",
    "Yadadri Bhuvanagiri"
  ],
  "tripura": [
    "Dhalai",
    "Gomati",
    "Khowai",
    "North Tripura",
    "Sepahijala",
    "South Tripura",
    "Unakoti",
    "West Tripura"
  ],
  "uttar_pradesh": [
    "Agra",
    "Aligarh",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Ayodhya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kushinagar",
    "Lakhimpur Kheri",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Prayagraj",
    "Raebareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi"
  ],
  "uttarakhand": [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi"
  ],
  "west_bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur"
  ],
  "I do not reside in India":["International"]
};

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    skills: [] as string[],
    interests: [] as string[],
    availability: '',
    experience: '',
    howHeard: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  
  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [date, setDate] = useState(null);

  // Custom month names to match the exact styling
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDate = (date) => {
    if (!date) return 'Select date';
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const currentSkills = [...prev.skills];
      if (currentSkills.includes(skill)) {
        return { ...prev, skills: currentSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...currentSkills, skill] };
      }
    });
  };
  
  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const currentInterests = [...prev.interests];
      if (currentInterests.includes(interest)) {
        return { ...prev, interests: currentInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...currentInterests, interest] };
      }
    });
  };
  
  const isStepValid = () => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.email && formData.phone && formData.password;
    } else if (step === 2) {
      return formData.skills.length > 0 && formData.interests.length > 0 && formData.availability;
    } else if (step === 3) {
      return formData.agreeTerms;
    }
    return false;
  };
  
  const nextStep = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before continuing.",
        variant: "destructive"
      });
    }
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid()) {
      try {
        setLoading(true);
        const result = await registerVolunteer(formData);
        
        if (result.success) {
          toast({
            title: "Registration Successful",
            description: "Your volunteer account has been created successfully!",
          });
          
          // Reset form and go to step 4 (completed)
          setStep(4);
        } else {
          toast({
            title: "Registration Failed",
            description: result.message,
            variant: "destructive"
          });
        }
      } catch (error: Error | unknown) {
        toast({
          title: "Registration Error",
          description: error instanceof Error ? error.message : "Something went wrong during registration.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Missing Information",
        description: "Please agree to the terms and conditions before submitting.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      
      <main className="flex-grow mt-16">
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Progress Steps */}
            <div className="mb-10">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map(stepNumber => (
                  <motion.div
                    key={stepNumber}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                      step === stepNumber 
                        ? 'bg-primary text-primary-foreground' 
                        : step > stepNumber 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                    initial={step === stepNumber ? { scale: 0.8 } : { scale: 1 }}
                    animate={step === stepNumber ? { scale: 1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step > stepNumber ? <Check className="h-6 w-6" /> : stepNumber}
                  </motion.div>
                ))}
              </div>
              <div className="relative flex justify-between">
                <div className="absolute top-0 left-6 right-6 flex-grow">
                  <div className="h-1 bg-muted rounded-full"></div>
                  <div 
                    className="h-1 bg-primary rounded-full absolute top-0 left-0 transition-all duration-500"
                    style={{ width: `${(step - 1) * 33.33}%` }}
                  ></div>
                </div>
                <div className="w-12 text-center text-xs mt-2">Personal<br />Info</div>
                <div className="w-12 text-center text-xs mt-2">Skills &<br />Interests</div>
                <div className="w-12 text-center text-xs mt-2">Terms &<br />Review</div>
                <div className="w-12 text-center text-xs mt-2">Complete</div>
              </div>
            </div>
            
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                        <p className="text-muted-foreground">
                          Tell us about yourself so we can match you with the right volunteering opportunities.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="required">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="required">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="required">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="required">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal bg-white border-gray-300 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
              <span className={!date ? 'text-gray-400' : ''}>
                {formatDate(date)}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date > new Date()}
            fromYear={1900}
            toYear={new Date().getFullYear()}
            captionLayout="dropdown-buttons"
            className="border-0 min-w-[300px]"
            components={{
              Dropdown: ({ ...props }) => (
                <select 
                  {...props}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm mx-1"
                />
              ),
              IconLeft: () => null, // Remove left arrow
              IconRight: () => null, // Remove right arrow
            }}
            styles={{
              caption: { 
                display: 'flex', 
                justifyContent: 'center',
                padding: '0.5rem 0.75rem',
              },
              caption_dropdowns: { 
                display: 'flex', 
                gap: '0.5rem',
                alignItems: 'center',
              },
              nav: {
                display: 'none', // Hide the entire nav container
              },
              head_cell: {
                width: '2.5rem',
                padding: '0.5rem 0',
              },
              cell: {
                width: '2.5rem',
                backgroundColor: 'transparent',
              },
            }}
          />
        </PopoverContent>
      </Popover>
    </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="required">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a secure password"
                          value={formData.password}
                          onChange={(e) => updateFormData('password', e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 6 characters long.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          placeholder="123 Main St, Apartment 4B"
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) => {
                              updateFormData('state', value);
                              updateFormData('city', ''); // Reset city when state changes
                            }}
                          >
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(stateCityMap).map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Select
                            value={formData.city}
                            onValueChange={(value) => updateFormData('city', value)}
                            disabled={!formData.state}
                          >
                            <SelectTrigger id="city">
                              <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.state && stateCityMap[formData.state]?.map((city) => (
                                <SelectItem key={city} value={city.toLowerCase().replace(/\s+/g, '_')}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Skills and Interests */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Skills & Interests</h2>
                        <p className="text-muted-foreground">
                          Tell us about your skills and areas of interest so we can match you with the right opportunities.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Label className="required text-md">Skills</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" type="button">
                                  <HelpCircle className="h-1 w-1" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                Select skills that you have and would like to use while volunteering.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['Teaching', 'Technology', 'Event Management', 'Writing', 'Design', 'Administration', 'Counseling', 'Language Translation'].map((skill) => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={`skill-${skill}`}
                                checked={formData.skills.includes(skill)}
                                onCheckedChange={() => handleSkillToggle(skill)}
                              />
                              <Label htmlFor={`skill-${skill}`} className="cursor-pointer">{skill}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Label className="required text-md">Areas of Interest</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" type="button">
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                Select areas you're interested in volunteering with.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['Education', 'Blog', 'Rehabilitation', 'Culture', 'Sports', 'Environment', 'Audio Recording', 'Field Work', 'Other'].map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={`interest-${interest}`}
                                checked={formData.interests.includes(interest)}
                                onCheckedChange={() => handleInterestToggle(interest)}
                              />
                              <Label htmlFor={`interest-${interest}`} className="cursor-pointer">{interest}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label htmlFor="availability" className="required text-md">Availability</Label>
                        <RadioGroup 
                          id="availability" 
                          value={formData.availability}
                          onValueChange={(value) => updateFormData('availability', value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekdays" id="weekdays" />
                            <Label htmlFor="weekdays">Weekdays</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekends" id="weekends" />
                            <Label htmlFor="weekends">Weekends</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both">Both</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experience">Previous Volunteer Experience</Label>
                        <Textarea 
                          id="experience" 
                          placeholder="Share any previous volunteer experience you have..." 
                          value={formData.experience}
                          onChange={(e) => updateFormData('experience', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="howHeard">How did you hear about us?</Label>
                        <Select 
                          value={formData.howHeard} 
                          onValueChange={(value) => updateFormData('howHeard', value)}
                        >
                          <SelectTrigger id="howHeard">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="friend">Friend or Family</SelectItem>
                            <SelectItem value="search">Search Engine</SelectItem>
                            <SelectItem value="event">Community Event</SelectItem>
                            <SelectItem value="news">News or Media</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 3: Terms and Review */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Review & Terms</h2>
                        <p className="text-muted-foreground">
                          Please review your information and agree to our terms and conditions.
                        </p>
                      </div>

                      <div className="bg-muted p-4 rounded-lg space-y-4">
                        <div>
                          <h3 className="font-semibold">Personal Information</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-muted-foreground text-sm">Name:</span>
                              <p>{formData.firstName} {formData.lastName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Email:</span>
                              <p>{formData.email}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Phone:</span>
                              <p>{formData.phone}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Location:</span>
                              <p>
                                {[formData.city, formData.state]
                                  .filter(Boolean)
                                  .map(str => str.split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' '))
                                  .join(', ') || 'Not Provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold">Skills & Interests</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-muted-foreground text-sm">Skills:</span>
                              <p>{formData.skills.join(', ') || 'None Selected'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Interests:</span>
                              <p>{formData.interests.join(', ') || 'None Selected'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Availability:</span>
                              <p>
                                {formData.availability 
                                  ? formData.availability.charAt(0).toUpperCase() + formData.availability.slice(1)
                                  : 'Not Specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                          <p className="text-muted-foreground text-sm">
                            As a volunteer with Samarthanam Trust for the Disabled, I agree to:
                          </p>
                          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground text-sm">
                            <li>Abide by all policies, procedures, and guidelines of Samarthanam Trust.</li>
                            <li>Respect the privacy and dignity of all individuals I work with.</li>
                            <li>Fulfill my volunteer commitments or provide adequate notice if unable to do so.</li>
                            <li>Represent Samarthanam Trust in a positive and professional manner.</li>
                            <li>Complete any required training or orientation programs.</li>
                          </ul>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="agreeTerms"
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) => updateFormData('agreeTerms', checked)}
                            required
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="agreeTerms"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 required"
                            >
                              I agree to the terms and conditions
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              By checking this box, you confirm that you have read and agree to our terms.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 4: Completed */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="py-10 text-center space-y-6"
                    >
                      <div className="flex justify-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-12 w-12 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Registration Successful!</h2>
                        <p className="text-muted-foreground">
                          Thank you for signing up as a volunteer. You can now log in to your account to view and sign up for events.
                        </p>
                      </div>
                      
                      <div className="flex justify-center mt-6">
                        <Button 
                          onClick={() => navigate('/login')}
                          className="min-w-36"
                        >
                          Go to Login
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Form Navigation */}
                  {step < 4 && (
                    <div className="flex justify-between items-center mt-8">
                      {step > 1 ? (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={prevStep}
                          disabled={loading}
                        >
                          Back
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      
                      {step < 3 ? (
                        <Button 
                          type="button"
                          onClick={nextStep}
                          disabled={!isStepValid() || loading}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button 
                          type="submit"
                          disabled={!isStepValid() || loading}
                          className="flex items-center"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Register;
