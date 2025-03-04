import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./Registration.css";
import guideImage from "../../assets/images/travelimage.png";

// Validation Schema
const schema = yup.object().shape({
  nationality: yup.string().required("Nationality is required"),
});

const nationalities = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine", "Armenian", "Australian", "Austrian",
  "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian",
  "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian",
  "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican",
  "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch", "East Timorese", "Ecuadorean",
  "Egyptian", "Emirati", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Finnish", "French", "Gabonese",
  "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guinea-Bissauan", "Guyanese",
  "Haitian", "Honduran", "Hungarian", "Icelander", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli",
  "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kiribati", "Kuwaiti", "Kyrgyz",
  "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy",
  "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian",
  "Moldovan", "Monegasque", "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander",
  "Nicaraguan", "Nigerien", "Nigerian", "North Korean", "Norwegian", "Omani", "Pakistani", "Palauan", "Panamanian", "Papua New Guinean",
  "Paraguayan", "Peruvian", "Philippine", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian",
  "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean",
  "Slovak", "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer",
  "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan",
  "Trinidadian", "Tunisian", "Turkish", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbek", "Vanuatuan", "Venezuelan",
  "Vietnamese", "Yemeni", "Zambian", "Zimbabwean"
];

const TravellerForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data) => {
    console.log("Traveller Form Data:", data);
    alert("Traveller Registration Successful!");
  };

  return (
    <div
      className="registration-container"
      style={{
        backgroundImage: `url(${guideImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="registration-box">
        <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
          <label>Nationality</label>
          <select {...register("nationality")} className="dropdown">
            <option value="">Select your nationality</option>
            {nationalities.map((nationality) => (
              <option key={nationality} value={nationality}>{nationality}</option>
            ))}
          </select>
          <p className="error">{errors.nationality?.message}</p>

          <button type="submit" className="register-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default TravellerForm;