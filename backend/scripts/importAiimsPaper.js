import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacode07';

export const aiims100Questions = [
  {
    questionText: "______ is the type of drug distribution system in which drugs are given to the patient from the nursing station and the pharmacy supplies from the drug store.",
    options: ["Floor Stock System", "Unit Dose System", "Combination of Individual Prescription & Floor Stock System", "Individual Prescription Order System"],
    correctOptionIndex: 0,
    explanation: "In the Floor Stock System, medicines are stored in the nursing station and supplied by the pharmacy as stock. It is commonly used for frequently required medicines.",
    subject: "Hospital & Clinical Pharmacy"
  },
  {
    questionText: "Energy-giving, bodybuilding, protective and regulatory functions refer to which type of food function?",
    options: ["Cultural Functions", "Psychological Function", "Physiological Functions", "Social Functions"],
    correctOptionIndex: 2,
    explanation: "Physiological functions of food include providing energy, building body tissues, protecting against diseases, and regulating body processes.",
    subject: "Biochemistry & Nutrition"
  },
  {
    questionText: "Which of the following is/are true about the toxin?\n1. It is a toxic substance produced naturally.\n2. Dioxin produced as a by-product of certain chlorinated chemicals is a toxin.",
    options: ["Only 1", "Both 1 and 2", "Only 2", "Neither 1 nor 2"],
    correctOptionIndex: 0,
    explanation: "A toxin is a poisonous substance naturally produced by living organisms. Dioxin is an environmental toxic chemical/toxicant, but not a naturally produced biological toxin.",
    subject: "Pharmacology & Toxicology"
  },
  {
    questionText: "When doses of a drug are repeated in quick succession, a reduction in response occurs which is called ______.",
    options: ["Tachyphylaxis", "Idiosyncrasy", "Acquired tolerance", "Drug resistance"],
    correctOptionIndex: 0,
    explanation: "Tachyphylaxis is a rapid, acute decrease in response to a drug after repeated administration over a short period (e.g. ephedrine, nitrates).",
    subject: "Pharmacology"
  },
  {
    questionText: "Which of the following is/are the characteristics of Biphasic Liquid Dosage Forms?\n1. It contains two phases which are undissolved drug and the solvent system.\n2. The need for biphasic liquid dosage forms arises when drugs are poorly soluble.\n3. Elixirs and syrups are common examples of biphasic liquid dosage forms.",
    options: ["2 and 3 Only", "1 and 3 Only", "All 1, 2 and 3", "1 and 2 Only"],
    correctOptionIndex: 3,
    explanation: "Biphasic dosage forms (emulsions, suspensions) contain two phases. Elixirs and syrups are monophasic liquid solutions, making statement 3 incorrect.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "______ types of steroids interact with androgen receptors and enhance muscle mass and male sex hormones.",
    options: ["Ergosteroids", "Glucocorticoids", "Progestins", "Anabolic Steroids"],
    correctOptionIndex: 3,
    explanation: "Anabolic steroids mimic testosterone by binding to androgen receptors, promoting muscle protein synthesis and development of secondary sexual characteristics.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which of the following is/are the characteristic of Fractional Distillation?\n1. It is used to separate mixtures of liquids having similar boiling points.\n2. It is used to obtain essential oils and herbal distillates from aromatic herbs.",
    options: ["Both 1 and 2", "Only 1", "Neither 1 nor 2", "Only 2"],
    correctOptionIndex: 1,
    explanation: "Fractional distillation separates miscible liquids with close boiling points using a fractionating column. Essential oils are obtained by steam distillation.",
    subject: "Pharmaceutical Engineering"
  },
  {
    questionText: "Which of the following is/are the characteristic of Pharmaceutic drug-drug interactions?\n1. It is a physicochemical interaction occurring before administration, such as precipitation in IV fluids.\n2. These interactions occur when drugs have additive or opposing pharmacological effects.",
    options: ["Only 1", "Only 2", "Neither 1 nor 2", "Both 1 and 2"],
    correctOptionIndex: 0,
    explanation: "Pharmaceutical interactions are physicochemical incompatibilities occurring before administration in vitro (e.g. IV admixtures). Additive or opposing effects in vivo are pharmacodynamic.",
    subject: "Clinical Pharmacy"
  },
  {
    questionText: "Which of the following diseases falls under non-communicable diseases?\n1. Diabetes\n2. Cancer\n3. Rheumatic fever\n4. Leprosy",
    options: ["2, 3 and 4 Only", "1, 2 and 3 Only", "1, 3 and 4 Only", "All 1, 2, 3 and 4"],
    correctOptionIndex: 1,
    explanation: "Diabetes and cancer are non-communicable diseases. Rheumatic fever is a non-communicable immune sequela. Leprosy (Hansen's disease) is an infectious communicable disease caused by Mycobacterium leprae.",
    subject: "Health Education & Community Pharmacy"
  },
  {
    questionText: "Which of the following is not an ideal property of a Semi-solid Dosage Form?",
    options: ["Non-hygroscopic", "Non-greasy", "Rough texture", "Non-dehydrating"],
    correctOptionIndex: 2,
    explanation: "An ideal semi-solid preparation should be smooth, homogenous, and non-gritty. A rough texture is undesirable and irritates the skin.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Which of the following is not a type of capillaries?",
    options: ["Carotids", "Sinusoids", "Continuous", "Fenestrated"],
    correctOptionIndex: 0,
    explanation: "The three types of capillaries are continuous, fenestrated, and sinusoidal. Carotids are major elastic arteries supplying blood to the head and brain.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "______ is the process which involves soaking the powdered crude drug with the menstruum in a closed vessel to dissolve the soluble constituents.",
    options: ["Maceration", "Infusion", "Percolation", "Extraction"],
    correctOptionIndex: 0,
    explanation: "Maceration is an extraction process where powdered drug is soaked in menstruum in a closed vessel for an extended period (typically 7 days with occasional shaking).",
    subject: "Pharmacognosy"
  },
  {
    questionText: "Which of the following is an example of an alkylating anticancer drug?",
    options: ["Cyclophosphamide", "Methotrexate", "5-Fluorouracil", "Vincristine"],
    correctOptionIndex: 0,
    explanation: "Cyclophosphamide is a nitrogen mustard alkylating agent that cross-links DNA strands to prevent cancer cell replication.",
    subject: "Medicinal Chemistry & Pharmacology"
  },
  {
    questionText: "Which of the following is/are characteristic of a Separate State Council (Provincial Pharmacy Council)?\n1. Five members nominated by the State Government (at least three with pharmacy qualification/registered pharmacists).\n2. Four members elected by registered pharmacists of the State.\n3. One member elected by the State Medical Council.",
    options: ["Only 1", "Only 3", "1 and 3 Only", "1 and 2 Only"],
    correctOptionIndex: 0,
    explanation: "As per the Pharmacy Act 1948, Section 19, five members are nominated by the State Government of whom at least three possess a prescribed degree/diploma or are registered pharmacists.",
    subject: "Pharmaceutical Jurisprudence"
  },
  {
    questionText: "Which of the following is/are the functions of Progesterone hormone?\n1. Maintenance of uterine endometrium\n2. Stimulation of mammary duct formation\n3. Development and maintenance of female characteristics and behaviour",
    options: ["All 1, 2 and 3", "1 and 2 Only", "2 and 3 Only", "1 and 3 Only"],
    correctOptionIndex: 1,
    explanation: "Progesterone prepares and maintains the secretory endometrium for pregnancy and promotes mammary lobuloalveolar development. Estrogen is primarily responsible for female secondary sexual traits.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following is a type of Oral Route used for rapid drug absorption bypassing first-pass hepatic metabolism?",
    options: ["Intramuscular", "Sublingual Administration", "Intramedullary", "Subcutaneous"],
    correctOptionIndex: 1,
    explanation: "Sublingual administration involves placing the tablet beneath the tongue. The drug dissolves rapidly and diffuses into the systemic circulation through oral venous drainage, bypassing liver first-pass metabolism.",
    subject: "Pharmacology"
  },
  {
    questionText: "The Pharmacy Council of India's elected and nominated members shall hold office for a period of how many years?",
    options: ["6 years", "3 years", "2 years", "5 years"],
    correctOptionIndex: 3,
    explanation: "Under Section 7 of the Pharmacy Act 1948, nominated and elected members of the Pharmacy Council of India (PCI) hold office for a term of 5 years.",
    subject: "Pharmaceutical Jurisprudence"
  },
  {
    questionText: "What is the maximum disintegration time for uncoated compressed tablets as per Indian Pharmacopoeia (IP)?",
    options: ["15 minutes", "30 minutes", "60 minutes", "5 minutes"],
    correctOptionIndex: 0,
    explanation: "As per IP, the maximum disintegration time for standard uncoated tablets is 15 minutes in water at 37°C ± 2°C.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Which of the given options is true about the use of Diuretics?\n1. Increase the rate of urine formation by the kidneys.\n2. Decrease the amount of sodium and increase the amount of water in urine.",
    options: ["Only 1", "Both 1 and 2", "Neither 1 nor 2", "Only 2"],
    correctOptionIndex: 0,
    explanation: "Diuretics increase urine volume by promoting natriuresis (increased sodium excretion) along with water. Statement 2 is false because diuretics increase sodium excretion.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which drug increases the production of bronchial secretion and reduces its viscosity to facilitate removal by coughing?",
    options: ["Antitussives", "Expectorants", "Antihistaminics", "Pharyngeal Demulcents"],
    correctOptionIndex: 1,
    explanation: "Expectorants (mucokinetics like Guaiphenesin, Ammonium Chloride) promote the ejection of bronchial secretions by reducing viscosity.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which of the given diseases is NOT caused by Fungi?",
    options: ["Dhobi Itch", "Filariasis", "Ringworm", "Athlete's Foot"],
    correctOptionIndex: 1,
    explanation: "Filariasis is a parasitic infection caused by filarial nematodes (Wuchereria bancrofti), whereas Ringworm (Tinea), Dhobi itch (Tinea cruris), and Athlete's foot (Tinea pedis) are fungal.",
    subject: "Microbiology & Community Health"
  },
  {
    questionText: "Which of the following is NOT included in the Local Application route of drug administration?",
    options: ["Insertion", "Inhalation", "Instillation", "Lotions"],
    correctOptionIndex: 1,
    explanation: "Local application involves topical skin/mucosal administration (lotions, ointments, ocular instillations, rectal insertions). Inhalation is primarily classified under pulmonary/systemic routes.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Meninges are three thin membranes that protect the Central Nervous System. Which of the following is not one of them?",
    options: ["Median Sulcus", "Arachnoid Mater", "Dura Mater", "Pia Mater"],
    correctOptionIndex: 0,
    explanation: "The meninges consist of Dura mater (outer), Arachnoid mater (middle), and Pia mater (inner). Median sulcus is a longitudinal groove on the spinal cord surface.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following is the correct definition of Bioethics?",
    options: ["Ethical principles or codes designed for the medical profession", "Origin of ethical principles governing right and wrong behaviour", "Ethical principles for maintaining normal livelihood", "Study of moral beliefs of people"],
    correctOptionIndex: 0,
    explanation: "Bioethics is the study of ethical, social, and legal issues that arise in biomedicine and healthcare practices.",
    subject: "Pharmaceutical Ethics"
  },
  {
    questionText: "Which of the following is NOT a feature of a Drum Dryer?",
    options: ["Rapid heat drying and mass transfer", "Product is obtained completely dried", "Loading and unloading can be done without losses", "Heating time is only a few seconds"],
    correctOptionIndex: 2,
    explanation: "In drum dryers, scraping dried film with doctor knives may result in slight product loss, so zero loss is not a valid feature.",
    subject: "Pharmaceutical Engineering"
  },
  {
    questionText: "What is Phase III of healing in uncomplicated surgical wounds?",
    options: ["Healing (Remodelling) Stage", "Haemostasis Stage", "Inflammatory Stage", "Proliferation Stage"],
    correctOptionIndex: 0,
    explanation: "Wound healing phases are: 1. Haemostasis & Inflammation, 2. Proliferation/Granulation, 3. Remodelling (Maturation/Healing) where collagen cross-linking restores tissue tensile strength.",
    subject: "Pathophysiology"
  },
  {
    questionText: "Which of the following are the key principles of a Damage Assessment Survey?\n1. Listen\n2. Understand\n3. Look\n4. Action",
    options: ["Only 2, 3 and 4", "All 1, 2, 3 and 4", "Only 1, 2 and 4", "Only 1, 2 and 3"],
    correctOptionIndex: 1,
    explanation: "Damage assessment protocols require active listening, understanding the incident scope, thorough visual inspection, and initiating responsive corrective action.",
    subject: "Hospital Pharmacy Management"
  },
  {
    questionText: "Which of the following are long, thin cylindrical rods found in skeletal muscle?",
    options: ["Myofibrils", "Sarcoplasm", "Skeletal Muscle Fiber", "Sarcolemma"],
    correctOptionIndex: 0,
    explanation: "Myofibrils are cylindrical contractile organelles inside muscle fibers containing repeating actin and myosin sarcomeres.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following is/are characteristics of Bronsted-Lowry Acids and Bases?\n1. Acid is a proton donor and base is a proton acceptor.\n2. It applies only to aqueous solutions.\n3. It removes the role of solvent and classifies ammonia as a base.",
    options: ["2 and 3 Only", "1 and 3 Only", "All 1, 2 and 3", "Only 3"],
    correctOptionIndex: 1,
    explanation: "Bronsted-Lowry defines acids as proton (H+) donors and bases as proton acceptors in any solvent system, not just aqueous ones.",
    subject: "Pharmaceutical Chemistry"
  },
  {
    questionText: "Which recruitment test measures the capacity and potential for learning job-related skills?",
    options: ["Aptitude Test", "Intelligence Test", "Interest Test", "Job Test"],
    correctOptionIndex: 0,
    explanation: "An aptitude test measures an individual's innate potential and capacity to acquire specific skills through future training.",
    subject: "Pharmacy Administration"
  },
  {
    questionText: "As per the FDA, suspected adverse drug reactions for a new drug should be documented intensively within how many years of its market entry?",
    options: ["Five years", "Four years", "Three years", "One year"],
    correctOptionIndex: 0,
    explanation: "Post-marketing surveillance (Phase IV) requires heightened pharmacovigilance reporting for new chemical entities for at least the first 5 years after regulatory approval.",
    subject: "Pharmacovigilance & Jurisprudence"
  },
  {
    questionText: "Arrange the following dosage forms in decreasing order of their rate of bioavailability: Compressed Tablets, Solution, Capsules, Suspension",
    options: ["Solution > Suspension > Capsules > Compressed Tablets", "Capsules > Solution > Compressed Tablets > Suspension", "Suspension > Capsules > Solution > Compressed Tablets", "Solution > Compressed Tablets > Suspension > Capsules"],
    correctOptionIndex: 0,
    explanation: "Bioavailability rate follows: Solutions (no dissolution needed) > Suspensions (large surface area) > Capsules (gelatin shell dissolves quickly) > Compressed Tablets (requires disintegration + deaggregation + dissolution).",
    subject: "Biopharmaceutics"
  },
  {
    questionText: "Which Schedule of the Drugs and Cosmetics Rules, 1945 prescribes the standards for cosmetics?",
    options: ["Schedule S", "Schedule M", "Schedule P", "Schedule C"],
    correctOptionIndex: 0,
    explanation: "Schedule S prescribes the standards for cosmetics manufactured or sold in India.",
    subject: "Pharmaceutical Jurisprudence"
  },
  {
    questionText: "According to the Drugs and Cosmetics Act, 1940, which of the following does NOT fall under the definition of Misbranded Drugs?",
    options: ["False or misleading label/claim", "Imitation or substitute of another drug", "Not labelled in the prescribed manner", "Coloured or coated to conceal damage or appear of better therapeutic value"],
    correctOptionIndex: 1,
    explanation: "A drug that is an imitation or substitute of another drug is defined as a 'Spurious Drug' under Section 17B, not a misbranded drug.",
    subject: "Pharmaceutical Jurisprudence"
  },
  {
    questionText: "Which tablet excipient promotes the flow of granules or powders by reducing interparticle friction?",
    options: ["Adhesives", "Disintegrants", "Glidants", "Diluents"],
    correctOptionIndex: 2,
    explanation: "Glidants (e.g. colloidal silicon dioxide, talc) improve powder flowability during tablet compaction by reducing friction between particles.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Which type of drugs dramatically affects perception, emotion, and mental processes, causing altered states of reality?",
    options: ["Hallucinogens", "Stimulants", "Narcotic Analgesics", "Depressants"],
    correctOptionIndex: 0,
    explanation: "Hallucinogens (e.g. Lysergic acid diethylamide/LSD, Psilocybin, Mescaline) profoundly distort sensory perception, thought processes, and emotional states.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which of the following is NOT a function of connective tissue?",
    options: ["Provides immunity", "Supports and protects organs", "Stores fat as energy reserve", "Initiates and transmits action potentials"],
    correctOptionIndex: 3,
    explanation: "Initiating and transmitting electrical action potentials is the specialized function of Nervous Tissue (neurons), not connective tissue.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following is NOT a characteristic feature of Zopiclone?",
    options: ["Anticonvulsant and sedative properties", "Useful in short-term management of insomnia", "Produces dose-dependent CNS depression", "Exhibits muscle relaxant properties"],
    correctOptionIndex: 3,
    explanation: "Zopiclone is a cyclopyrrolone 'Z-drug' hypnotic that acts selectively on the alpha-1 subunit of GABA-A receptors, producing sedation with minimal muscle relaxation compared to classic benzodiazepines.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which test is used to detect bacterial endotoxins in injectable parenteral preparations that may cause fever?",
    options: ["Pyrogen Test", "Leakage Test", "Sterility Test", "Clarity Test"],
    correctOptionIndex: 0,
    explanation: "The Pyrogen Test (Rabbit test and LAL - Limulus Amebocyte Lysate test) detects bacterial endotoxins responsible for febrile responses in parenterals.",
    subject: "Pharmaceutics & Quality Control"
  },
  {
    questionText: "Which type of acute exudative inflammation involves liquefactive necrosis of tissue with pus formation?",
    options: ["Serous inflammation", "Fibrinous inflammation", "Ulcerative inflammation", "Suppurative inflammation"],
    correctOptionIndex: 3,
    explanation: "Suppurative (purulent) inflammation is characterized by the production of pus (rich in neutrophils, cellular debris, and necrotic fluid).",
    subject: "Pathophysiology"
  },
  {
    questionText: "Which of the following is/are the characteristics of Scheduled Banks in India?\n1. These banks are included in the Second Schedule of the RBI Act, 1934.\n2. They are not always required to submit financial returns to RBI.\n3. They can borrow money from RBI against approved securities.",
    options: ["Only 1", "1 and 3 Only", "All 1, 2 and 3", "2 and 3 Only"],
    correctOptionIndex: 1,
    explanation: "Scheduled banks are listed in the Second Schedule of the RBI Act 1934 and are eligible for refinance/loans from the RBI. They must strictly submit regular statutory returns (CRR/SLR).",
    subject: "General Awareness & Administration"
  },
  {
    questionText: "Which of the following is/are characteristics of Monosaccharides?\n1. They contain a 3–6 carbon atom chain with an aldehyde or ketone group.\n2. They are highly soluble in water due to hydroxyl groups.\n3. They have high solubility in non-polar solvents.",
    options: ["All 1, 2 and 3", "2 and 3 Only", "1 and 2 Only", "Only 2"],
    correctOptionIndex: 2,
    explanation: "Monosaccharides have multiple polar hydroxyl groups making them water-soluble and insoluble in non-polar organic solvents like benzene.",
    subject: "Biochemistry"
  },
  {
    questionText: "Which of the following is NOT a feature of Covalent Bonding?",
    options: ["Formation of sodium chloride (NaCl) is an example.", "More than one pair of electrons may be shared.", "Sharing of electrons does not produce ions.", "Atoms may belong to the same or different elements."],
    correctOptionIndex: 0,
    explanation: "Sodium chloride (NaCl) is formed via ionic (electrovalent) bonding involving complete electron transfer, not covalent sharing.",
    subject: "Pharmaceutical Chemistry"
  },
  {
    questionText: "Which of the following is/are INCORRECT about a Prosthetic Group?\n1. It is tightly or covalently bound to the enzyme.\n2. Its binding with the enzyme is temporary.",
    options: ["Both 1 and 2", "Only 1", "Only 2", "Neither 1 nor 2"],
    correctOptionIndex: 2,
    explanation: "Prosthetic groups are non-protein cofactors that remain permanently and tightly (often covalently) bound to the apoenzyme. Coenzymes bind transiently/temporarily.",
    subject: "Biochemistry"
  },
  {
    questionText: "______ is a fourth-generation cephalosporin mainly used for serious hospital-acquired infections including Pseudomonas aeruginosa.",
    options: ["Cefepime", "Ceftazidime", "Cefotaxime", "Cefazolin"],
    correctOptionIndex: 0,
    explanation: "Cefepime is a 4th-generation cephalosporin with enhanced zwitterionic permeability and high resistance to beta-lactamases, covering Gram-positive cocci and Pseudomonas.",
    subject: "Pharmacology"
  },
  {
    questionText: "Deadly Nightshade is the common English name for which tropane alkaloid-containing medicinal plant?",
    options: ["Atropa belladonna", "Datura stramonium", "Hyoscyamus niger", "Duboisia myoporoides"],
    correctOptionIndex: 0,
    explanation: "Atropa belladonna (family Solanaceae) is commonly known as Deadly Nightshade and yields hyoscyamine and atropine.",
    subject: "Pharmacognosy"
  },
  {
    questionText: "Which topical antihistaminic agent also possesses leukotriene and platelet-activating factor (PAF) antagonistic activity?",
    options: ["Azelastine Hydrochloride", "Emedastine Difumarate", "Levocabastine Hydrochloride", "Pheniramine Maleate"],
    correctOptionIndex: 0,
    explanation: "Azelastine is a second-generation H1 blocker with mast cell stabilizing, anti-leukotriene, and anti-PAF properties used in allergic conjunctivitis and rhinitis.",
    subject: "Pharmacology"
  },
  {
    questionText: "______ anatomy describes groups of organs that function together for a single integrated purpose.",
    options: ["Cytology", "Surface Anatomy", "Developmental Anatomy", "Systemic Anatomy"],
    correctOptionIndex: 3,
    explanation: "Systemic anatomy studies the body by organ systems (cardiovascular, nervous, digestive, respiratory, endocrine).",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "The skeleton in the adult human body makes up approximately how much of total healthy body weight?",
    options: ["One-third", "Three-fourth", "One-fifth", "Two-fourth"],
    correctOptionIndex: 2,
    explanation: "The adult human skeletal system comprises 206 bones accounting for approximately 15% to 20% (one-fifth) of total body weight.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which branch of toxicology is concerned with gathering toxicological information from in vivo animal experiments?",
    options: ["Regulatory Toxicology", "Clinical Toxicology", "Occupational Toxicology", "Descriptive Toxicology"],
    correctOptionIndex: 3,
    explanation: "Descriptive toxicology performs standardized animal toxicity tests (acute, subacute, chronic, mutagenicity, carcinogenicity) to evaluate hazard profiles.",
    subject: "Pharmacology & Toxicology"
  },
  {
    questionText: "The structure of the sales organization depends upon which of the following factors?\n1. Methods of distribution adopted by the firm\n2. Personality and leadership style of the sales manager",
    options: ["Only 2", "Only 1", "Neither 1 nor 2", "Both 1 and 2"],
    correctOptionIndex: 3,
    explanation: "A sales organization's structure is determined by strategic distribution channels, product line diversity, market geography, and management leadership.",
    subject: "Drug Store & Business Management"
  },
  {
    questionText: "Which of the following is/are characteristics of Positive Mixtures in pharmaceutical mixing?\n1. Formed from gases or miscible liquids.\n2. No external energy is needed if sufficient time is available.\n3. Includes emulsions, creams, and viscous suspensions.",
    options: ["1 and 2 Only", "1 and 3 Only", "2 and 3 Only", "All 1, 2 and 3"],
    correctOptionIndex: 0,
    explanation: "Positive mixtures mix irreversibly by spontaneous diffusion without energy input. Emulsions and suspensions are negative mixtures that separate unless stabilized.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "According to the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954, what are the penalties for contravening the provisions of the Act?\n1. First conviction: Imprisonment up to 6 months or fine or both.\n2. Subsequent conviction: Imprisonment up to 1 year or fine or both.",
    options: ["Only 2", "Both 1 and 2", "Only 1", "Neither 1 nor 2"],
    correctOptionIndex: 1,
    explanation: "Section 7 of the Drugs and Magic Remedies Act prescribes imprisonment up to 6 months for first conviction and up to 1 year for subsequent convictions.",
    subject: "Pharmaceutical Jurisprudence"
  },
  {
    questionText: "What is the optimum temperature for catalytic activity of most human enzymes?",
    options: ["47°C", "37°C", "67°C", "57°C"],
    correctOptionIndex: 1,
    explanation: "Most human physiological enzymes exhibit peak enzymatic velocity at normal core body temperature (37°C / 98.6°F) and denature above 45°C–50°C.",
    subject: "Biochemistry"
  },
  {
    questionText: "Which type of environmental toxic agents are elemental and can neither be created nor destroyed by biological degradation?",
    options: ["Pesticides", "Solvents", "Heavy Metals", "Furans"],
    correctOptionIndex: 2,
    explanation: "Heavy metals (Lead, Mercury, Cadmium, Arsenic) are elemental in nature, non-biodegradable, and bioaccumulate in food chains.",
    subject: "Pharmacology & Toxicology"
  },
  {
    questionText: "Which of the following is/are NOT characteristics of the Pre-pathogenesis Phase in natural history of disease?\n1. Disease agent has entered the human host.\n2. Agent-host-environment interaction exists in external environment.\n3. Clinical signs and symptoms are absent.",
    options: ["Only 2 and 3", "Only 2", "Only 1", "Only 1 and 3"],
    correctOptionIndex: 2,
    explanation: "In pre-pathogenesis, the disease agent has NOT entered the human host yet; preliminary interactions between agent, host risk factors, and environmental determinants occur externally.",
    subject: "Community Pharmacy"
  },
  {
    questionText: "In which product situation does Personal Selling become most effective and economical in pharmaceutical sales?\n1. Product is in maturity stage requiring demand creation.\n2. Product requires technical demonstration and clinical detailing.\n3. Product has poor brand loyalty and complex dosage regimens.",
    options: ["1 and 3 Only", "1 and 2 Only", "All 1, 2 and 3", "2 and 3 Only"],
    correctOptionIndex: 3,
    explanation: "Personal selling / medical detailing is essential when pharmaceuticals require clinical explanation, demonstrating therapeutic advantages, or countering competitor brands.",
    subject: "Drug Store & Business Management"
  },
  {
    questionText: "According to the classification of Antineoplastic Agents, which of the following is NOT an Antimetabolite?",
    options: ["Purine Analogues", "Folic Acid Analogues", "Aziridines", "Pyrimidine Analogues"],
    correctOptionIndex: 2,
    explanation: "Aziridines (e.g. Thiotepa) are Alkylating agents. Methotrexate is a folic acid analogue, 6-Mercaptopurine is a purine analogue, and 5-Fluorouracil is a pyrimidine analogue.",
    subject: "Medicinal Chemistry & Pharmacology"
  },
  {
    questionText: "Which of the following correctly describes the biochemical function of Vitamin K?",
    options: ["Helps tissue formation and turnover", "Required for synthesis of blood-clotting factors (II, VII, IX, X)", "Plays an active role in calcium metabolism", "Acts as a primary intracellular antioxidant"],
    correctOptionIndex: 1,
    explanation: "Vitamin K acts as an essential cofactor for gamma-glutamyl carboxylase, activating coagulation factors II (prothrombin), VII, IX, and X in the liver.",
    subject: "Biochemistry & Pharmacology"
  },
  {
    questionText: "What is the primary physiological function of the Insulin hormone secreted by beta cells of the pancreas?",
    options: ["Decreases blood glucose and promotes anabolic protein & lipid synthesis", "Inhibits acid secretion in the stomach", "Aids in HCl secretion by parietal cells", "Increases blood glucose by glycogenolysis"],
    correctOptionIndex: 0,
    explanation: "Insulin promotes glucose entry via GLUT4 into skeletal muscle and adipose tissue, stimulating glycogenesis, lipogenesis, and protein synthesis.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following is a characteristic feature of a True Solution?",
    options: ["Particle size is more than 1000 nm", "Particles settle on standing", "Particle size is less than 1 nm", "It can be separated by ordinary filter paper"],
    correctOptionIndex: 2,
    explanation: "True solutions are homogenous molecular dispersions with solute particle size < 1 nm (10 Å), which pass through ordinary filter paper and semipermeable membranes.",
    subject: "Physical Pharmaceutics"
  },
  {
    questionText: "Which of the following hormones stimulates milk synthesis/production in mammary glands following childbirth?",
    options: ["Oxytocin", "Prolactin", "Estrogen", "Progesterone"],
    correctOptionIndex: 1,
    explanation: "Prolactin (from anterior pituitary) stimulates milk production and lactation. Oxytocin (from posterior pituitary) causes milk ejection / let-down.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following is an example of a Loop Diuretic (High-ceiling Diuretic)?",
    options: ["Hydrochlorothiazide", "Spironolactone", "Furosemide", "Mannitol"],
    correctOptionIndex: 2,
    explanation: "Furosemide inhibits the Na+/K+/2Cl- symporter in the thick ascending limb of the loop of Henle, producing potent diuresis.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which of the following dosage forms is specifically intended for drug administration via the rectal route?",
    options: ["Troche", "Suppository", "Lozenge", "Pessary"],
    correctOptionIndex: 1,
    explanation: "Suppositories are solid unit dosage forms inserted into the rectum. Pessaries are intended for vaginal insertion.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Deficiency of which fat-soluble vitamin causes Night Blindness (Nyctalopia) and Xerophthalmia?",
    options: ["Vitamin C", "Vitamin D", "Vitamin A", "Vitamin E"],
    correctOptionIndex: 2,
    explanation: "Vitamin A (Retinol) is essential for rhodopsin synthesis in retinal rods. Deficiency leads to night blindness, Bitot's spots, and xerophthalmia.",
    subject: "Biochemistry & Nutrition"
  },
  {
    questionText: "Which of the following is the specific antidote for Unfractionated Heparin overdose?",
    options: ["Vitamin K", "Protamine Sulphate", "Atropine", "Naloxone"],
    correctOptionIndex: 1,
    explanation: "Protamine sulphate is a strongly basic polypeptide that binds with acidic heparin to form a stable inactive salt complex.",
    subject: "Pharmacology & Toxicology"
  },
  {
    questionText: "Which organ is the principal site for drug metabolism and biotransformation in the human body?",
    options: ["Kidney", "Liver", "Lung", "Spleen"],
    correctOptionIndex: 1,
    explanation: "The liver is the primary metabolic organ, rich in Cytochrome P450 monooxygenases (Phase I) and conjugating enzymes (Phase II).",
    subject: "Pharmacology"
  },
  {
    questionText: "Which plasma protein predominantly binds acidic drugs such as NSAIDs, Warfarin, and Phenytoin?",
    options: ["Albumin", "Alpha-1 acid glycoprotein", "Hemoglobin", "Fibrinogen"],
    correctOptionIndex: 0,
    explanation: "Human serum albumin has specific basic binding sites that bind acidic drugs. Basic drugs bind to Alpha-1 acid glycoprotein.",
    subject: "Pharmacology & Biopharmaceutics"
  },
  {
    questionText: "Which of the following is an example of a bactericidal Aminoglycoside antibiotic?",
    options: ["Ciprofloxacin", "Gentamicin", "Doxycycline", "Azithromycin"],
    correctOptionIndex: 1,
    explanation: "Gentamicin, Streptomycin, Amikacin, and Tobramycin are aminoglycoside antibiotics that bind to the 30S bacterial ribosomal subunit.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which route of drug administration inherently provides 100% systemic bioavailability (F = 1)?",
    options: ["Oral", "Intramuscular", "Intravenous", "Subcutaneous"],
    correctOptionIndex: 2,
    explanation: "Intravenous (IV) bolus injection delivers the full drug dose directly into the venous circulation, giving 100% bioavailability by definition.",
    subject: "Biopharmaceutics"
  },
  {
    questionText: "Which of the following colloidal solutions is commonly used as a Plasma Volume Expander in hypovolemic shock?",
    options: ["Dextran 70", "Mannitol", "Furosemide", "Dextrose 5%"],
    correctOptionIndex: 0,
    explanation: "Dextran 70, Polygeline (Haemaccel), and Hydroxyethyl starch (HES) are oncotic plasma volume expanders used to restore circulating volume.",
    subject: "Hospital Pharmacy & Pharmacology"
  },
  {
    questionText: "Which segment of the renal nephron is responsible for the majority (65–70%) of selective reabsorption of filtered water and solutes?",
    options: ["Bowman's Capsule", "Proximal Convoluted Tubule (PCT)", "Glomerulus", "Collecting Duct"],
    correctOptionIndex: 1,
    explanation: "The Proximal Convoluted Tubule (PCT) has an extensive brush border that reabsorbs ~65-70% of Na+, Cl-, water, and 100% of filtered glucose and amino acids.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following anti-ulcer drugs is a Proton Pump Inhibitor (PPI)?",
    options: ["Ranitidine", "Omeprazole", "Sucralfate", "Magnesium Hydroxide"],
    correctOptionIndex: 1,
    explanation: "Omeprazole, Pantoprazole, and Rabeprazole inhibit gastric H+/K+-ATPase in parietal cells, suppressing basal and stimulated acid secretion.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which dosage form is engineered to release the active drug steadily over an extended period to maintain therapeutic blood levels?",
    options: ["Immediate-release Tablet", "Sustained-release (SR) Tablet", "Chewable Tablet", "Sublingual Tablet"],
    correctOptionIndex: 1,
    explanation: "Sustained-release / Extended-release dosage forms provide continuous drug release over 12–24 hours, reducing dosing frequency.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Deficiency of which water-soluble vitamin causes Scurvy, characterized by fragile capillaries and bleeding gums?",
    options: ["Vitamin B12", "Vitamin D", "Vitamin C (Ascorbic Acid)", "Vitamin K"],
    correctOptionIndex: 2,
    explanation: "Vitamin C is an essential cofactor for prolyl and lysyl hydroxylase in collagen synthesis. Scurvy results from defective collagen formation.",
    subject: "Biochemistry"
  },
  {
    questionText: "Which oral anticoagulant acts by competitively inhibiting Vitamin K epoxide reductase (VKOR)?",
    options: ["Heparin", "Warfarin", "Enoxaparin", "Dabigatran"],
    correctOptionIndex: 1,
    explanation: "Warfarin inhibits Vitamin K Epoxide Reductase Complex 1 (VKORC1), blocking conversion of vitamin K epoxide to active hydroquinone.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which of the following is the structural and functional microscopic unit of the kidney?",
    options: ["Alveolus", "Nephron", "Osteon", "Sarcomere"],
    correctOptionIndex: 1,
    explanation: "Each kidney contains approximately 1 to 1.2 million nephrons that perform filtration, selective reabsorption, and tubular secretion.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which class of antibiotics inhibits bacterial cell wall peptidoglycan cross-linking by binding to transpeptidases (PBPs)?",
    options: ["Penicillins", "Tetracyclines", "Erythromycin", "Chloramphenicol"],
    correctOptionIndex: 0,
    explanation: "Beta-lactam antibiotics (penicillins, cephalosporins) bind to penicillin-binding proteins (PBPs) and inhibit the transpeptidation reaction in cell wall synthesis.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which of the following pure opioid receptor antagonists is the emergency drug of choice for acute Morphine/Opioid poisoning?",
    options: ["Atropine", "Naloxone", "Flumazenil", "Protamine Sulphate"],
    correctOptionIndex: 1,
    explanation: "Naloxone is a competitive antagonist at mu, kappa, and delta opioid receptors that rapidly reverses opioid-induced respiratory depression and coma.",
    subject: "Pharmacology & Toxicology"
  },
  {
    questionText: "Which sterile liquid preparation is specifically formulated for instillation into the conjunctival sac of the eye?",
    options: ["Nasal Drops", "Otic Drops", "Ophthalmic Drops", "Gargles"],
    correctOptionIndex: 2,
    explanation: "Ophthalmic eye drops must be sterile, isotonic with lacrimal fluid (0.9% NaCl equivalent), buffered (pH 7.4), and free from particulate matter.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Which of the following is a non-selective beta-adrenergic blocker without intrinsic sympathomimetic activity?",
    options: ["Atenolol", "Metoprolol", "Propranolol", "Bisoprolol"],
    correctOptionIndex: 2,
    explanation: "Propranolol blocks both beta-1 (cardiac) and beta-2 (bronchial/vascular) adrenergic receptors. Atenolol, Metoprolol, and Bisoprolol are beta-1 selective (cardioselective).",
    subject: "Pharmacology"
  },
  {
    questionText: "Which endocrine gland is historically referred to as the 'Master Gland' of the endocrine system?",
    options: ["Thyroid Gland", "Pituitary Gland (Hypophysis)", "Adrenal Gland", "Pineal Gland"],
    correctOptionIndex: 1,
    explanation: "The anterior pituitary secretes tropic hormones (TSH, ACTH, FSH, LH, GH, Prolactin) that control other major peripheral endocrine glands.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following antibiotics belongs to the Macrolide class containing a 14- or 15-membered lactone ring?",
    options: ["Gentamicin", "Ciprofloxacin", "Azithromycin", "Ceftriaxone"],
    correctOptionIndex: 2,
    explanation: "Azithromycin, Erythromycin, and Clarithromycin are macrolides that inhibit bacterial protein synthesis by reversibly binding to the 50S ribosomal subunit.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which fat-soluble vitamin is converted into calcitriol (1,25-dihydroxycholecalciferol) to promote intestinal calcium absorption?",
    options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
    correctOptionIndex: 2,
    explanation: "Vitamin D3 (Cholecalciferol) is hydroxylated in the liver (25-OH) and kidney (1,25-(OH)2D3) to facilitate active calcium and phosphate absorption.",
    subject: "Biochemistry & Pharmacology"
  },
  {
    questionText: "Which of the following routes of administration avoids hepatic portal first-pass metabolism?",
    options: ["Oral Route", "Sublingual Route", "Intragastric Route", "Oral Capsule"],
    correctOptionIndex: 1,
    explanation: "Sublingual tablets (e.g. Nitroglycerin) drain directly into the superior vena cava, bypassing the hepatic portal circulation.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which plasma protein is primarily responsible for maintaining intravascular Colloid Oncotic Pressure (COP)?",
    options: ["Albumin", "Alpha Globulin", "Fibrinogen", "Hemoglobin"],
    correctOptionIndex: 0,
    explanation: "Albumin accounts for approximately 75–80% of total plasma colloid osmotic pressure, preventing fluid leakage into interstitial spaces.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which antimuscarinic agent is the specific pharmacological antidote for Organophosphate / Insecticide poisoning?",
    options: ["Naloxone", "Protamine Sulphate", "Atropine Sulphate", "Vitamin K"],
    correctOptionIndex: 2,
    explanation: "Atropine competitively blocks muscarinic acetylcholine receptors, counteracting life-threatening bronchospasm, bronchorrhea, and bradycardia. Pralidoxime (2-PAM) is given alongside to reactivate acetylcholinesterase.",
    subject: "Pharmacology & Toxicology"
  },
  {
    questionText: "Which organ stores and concentrates bile produced continuously by hepatocytes in the liver?",
    options: ["Pancreas", "Gallbladder", "Spleen", "Duodenum"],
    correctOptionIndex: 1,
    explanation: "Bile is synthesized by the liver and stored in the gallbladder, which releases it into the duodenum via the common bile duct in response to cholecystokinin (CCK).",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following is a broad-spectrum, long-acting Tetracycline derivative effective against atypical bacteria?",
    options: ["Doxycycline", "Amoxicillin", "Cefixime", "Rifampicin"],
    correctOptionIndex: 0,
    explanation: "Doxycycline is a lipophilic tetracycline that inhibits the 30S ribosomal subunit. It is active against Mycoplasma, Chlamydia, Rickettsia, and Plasmodium.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which specialized pharmaceutical dosage form delivers drug across intact skin into the systemic circulation at a controlled rate?",
    options: ["Ointment", "Cream", "Transdermal Therapeutic System (Patch)", "Dusting Powder"],
    correctOptionIndex: 2,
    explanation: "Transdermal patches (e.g. Fentanyl, Nitroglycerin, Nicotine) provide sustained zero-order systemic drug delivery across the stratum corneum.",
    subject: "Pharmaceutics"
  },
  {
    questionText: "Which of the following is a dihydropyridine Calcium Channel Blocker (CCB) used as a first-line antihypertensive?",
    options: ["Propranolol", "Amlodipine", "Enalapril", "Losartan"],
    correctOptionIndex: 1,
    explanation: "Amlodipine selectively blocks L-type voltage-gated calcium channels in vascular smooth muscle, producing peripheral arteriolar vasodilation.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which ABO blood group is termed the 'Universal Donor' for red blood cell transfusions because it lacks A, B, and Rh antigens?",
    options: ["A Positive", "B Positive", "AB Positive", "O Negative"],
    correctOptionIndex: 3,
    explanation: "O Negative red blood cells lack A, B, and Rh(D) surface antigens, so they will not be agglutinated by anti-A, anti-B, or anti-D antibodies in the recipient's plasma.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following anti-ulcer drugs is an H2-histamine receptor antagonist?",
    options: ["Omeprazole", "Pantoprazole", "Famotidine", "Sucralfate"],
    correctOptionIndex: 2,
    explanation: "Famotidine, Ranitidine, and Cimetidine competitively inhibit H2 receptors on parietal cells, reducing cyclic AMP and gastric acid secretion.",
    subject: "Pharmacology"
  },
  {
    questionText: "Deficiency of Folic Acid (Vitamin B9) or Cobalamin (Vitamin B12) leads to which type of anaemia?",
    options: ["Microcytic Anaemia", "Aplastic Anaemia", "Megaloblastic / Macrocytic Anaemia", "Hemolytic Anaemia"],
    correctOptionIndex: 2,
    explanation: "Folate deficiency impairs thymidylate and DNA synthesis during erythropoiesis, leading to abnormal red cell maturation and megaloblasts in bone marrow.",
    subject: "Biochemistry & Pathology"
  },
  {
    questionText: "Which route of administration is preferred in critical emergencies (e.g. cardiac arrest, status epilepticus) for instantaneous therapeutic effect?",
    options: ["Oral", "Intravenous (IV)", "Topical", "Rectal"],
    correctOptionIndex: 1,
    explanation: "The intravenous route produces the fastest therapeutic onset without absorption delay, allowing precise titration of critical emergency drugs.",
    subject: "Hospital Pharmacy"
  },
  {
    questionText: "Which of the following is a propionic acid derivative Non-Steroidal Anti-Inflammatory Drug (NSAID)?",
    options: ["Paracetamol", "Ibuprofen", "Morphine", "Tramadol"],
    correctOptionIndex: 1,
    explanation: "Ibuprofen, Naproxen, and Ketoprofen are propionic acid NSAIDs that non-selectively inhibit COX-1 and COX-2 enzymes to provide analgesic, antipyretic, and anti-inflammatory effects.",
    subject: "Pharmacology"
  },
  {
    questionText: "Which endocrine cell population in the pancreas is the primary site of Insulin synthesis and secretion?",
    options: ["Alpha cells", "Beta cells (Islets of Langerhans)", "Delta cells", "Acinar cells"],
    correctOptionIndex: 1,
    explanation: "Beta cells located in the Islets of Langerhans synthesize proinsulin and secrete active insulin in response to elevated blood glucose.",
    subject: "Human Anatomy & Physiology"
  },
  {
    questionText: "Which of the following pathogenic microorganisms is a Gram-positive coccus that characteristically forms grape-like clusters?",
    options: ["Escherichia coli", "Pseudomonas aeruginosa", "Staphylococcus aureus", "Vibrio cholerae"],
    correctOptionIndex: 2,
    explanation: "Staphylococcus aureus is a catalase-positive, coagulase-positive Gram-positive spherical bacterium arranged in irregular clusters.",
    subject: "Microbiology"
  },
  {
    questionText: "Which pharmacokinetic parameter represents the time required for plasma drug concentration to decrease by 50%?",
    options: ["Clearance (Cl)", "Volume of Distribution (Vd)", "Elimination Half-life (t1/2)", "Bioavailability (F)"],
    correctOptionIndex: 2,
    explanation: "Biological elimination half-life (t1/2 = 0.693 * Vd / Cl) is the time required for the circulating drug concentration in plasma to decline by half.",
    subject: "Biopharmaceutics & Pharmacokinetics"
  },
  {
    questionText: "Which pharmaceutical dosage form delivers fine aerosolized droplets directly to the nasal mucosa for allergic rhinitis or decongestion?",
    options: ["Eye Drops", "Ear Drops", "Nasal Spray / Metered Nasal Aerosol", "Gargle"],
    correctOptionIndex: 2,
    explanation: "Nasal sprays (e.g. Oxymetazoline, Fluticasone) provide localized mucosal deposition with minimal systemic side effects.",
    subject: "Pharmaceutics"
  }
];

const importAiimsPaper = async () => {
  try {
    console.log('🌱 Connecting to MongoDB Atlas for AIIMS paper import...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to Atlas!');

    // 1. Create or Find AIIMS Test Series Package
    let aiimsSeries = await TestSeries.findOne({ examType: 'AIIMS' });
    if (!aiimsSeries) {
      aiimsSeries = await TestSeries.create({
        title: 'AIIMS Pharmacist 2026 – Official 100 MCQ Model Test Series',
        slug: 'aiims-pharmacist-2026-mock-test-series',
        description: 'Complete high-yield official mock test series for AIIMS Pharmacist Grade-II recruitment exams. Includes full 100 MCQs per paper with authentic explanations, timer, and negative marking (-0.25).',
        category: 'Competitive Exam',
        examType: 'AIIMS',
        thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
        totalTests: 1,
        totalQuestions: 100,
        price: 399,
        discountPrice: 149,
        isFree: false,
        published: true,
        highlights: [
          'Authentic AIIMS Grade-II (19 Aug 2023 Shift-2) 100 MCQs',
          'Exact exam pattern with negative marking (-0.25)',
          'Comprehensive pharmacological explanations for every question',
          'Instant scoring and rank prediction',
        ],
      });
      console.log('✨ Created AIIMS Test Series Package:', aiimsSeries.title);
    }

    // 2. Create the TestPaper with all 100 extracted questions
    const existingPaper = await TestPaper.findOne({
      testSeriesId: aiimsSeries._id,
      title: 'AIIMS Pharmacist Grade-II (19 Aug 2023 Shift-2) – 100 MCQs Official Paper',
    });

    if (existingPaper) {
      existingPaper.questions = aiims100Questions;
      existingPaper.totalMarks = 100;
      existingPaper.totalQuestions = 100;
      await existingPaper.save();
      console.log('🔄 Updated existing AIIMS Test Paper with 100 MCQs!');
    } else {
      await TestPaper.create({
        testSeriesId: aiimsSeries._id,
        title: 'AIIMS Pharmacist Grade-II (19 Aug 2023 Shift-2) – 100 MCQs Official Paper',
        paperNumber: 1,
        durationMinutes: 100,
        totalMarks: 100,
        positiveMarks: 1,
        negativeMarks: 0.25,
        difficulty: 'Medium',
        questions: aiims100Questions,
        published: true,
      });
      console.log('🎉 Successfully created AIIMS 100 MCQ Test Paper in Database!');
    }

    // 3. Update total counts on test series
    const papers = await TestPaper.find({ testSeriesId: aiimsSeries._id });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    aiimsSeries.totalTests = papers.length;
    aiimsSeries.totalQuestions = totalQ;
    await aiimsSeries.save();

    console.log(`✅ All done! ${aiims100Questions.length} AIIMS MCQs are now LIVE in MongoDB Atlas.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Import Failed:', error);
    process.exit(1);
  }
};

importAiimsPaper();
