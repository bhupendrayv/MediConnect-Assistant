const symptomData = {
    'fever': {
        disease: 'Viral Infection / Pyrexia',
        specialist: 'General Physician',
        severity: 'Low',
        solution: 'Stay well-hydrated, get adequate rest, take paracetamol if prescribed, and monitor temperature regularly. Consult a doctor if fever exceeds 102°F or lasts over 3 days.'
    },
    'high fever': {
        disease: 'Acute Infection / Typhoid / Dengue Risk',
        specialist: 'General Physician',
        severity: 'Medium',
        solution: 'Drink fluids with electrolytes, apply cool sponge to forehead, avoid strenuous activities, and obtain a complete blood count (CBC) test.'
    },
    'cough': {
        disease: 'Upper Respiratory Infection / Bronchitis',
        specialist: 'General Physician',
        severity: 'Low',
        solution: 'Drink warm fluids with honey, practice salt water gargles twice daily, use steam inhalation, and avoid cold or sugary beverages.'
    },
    'dry cough': {
        disease: 'Pharyngitis / Allergic Cough',
        specialist: 'Pulmonologist',
        severity: 'Low',
        solution: 'Stay hydrated, use a humidifier, drink lukewarm ginger tea, and avoid exposure to dust and smoke.'
    },
    'headache': {
        disease: 'Tension Headache / Migraine',
        specialist: 'Neurologist',
        severity: 'Medium',
        solution: 'Rest in a quiet, dark room, apply a cool compress to your forehead or neck, drink water, and reduce screen time.'
    },
    'migraine': {
        disease: 'Chronic Migraine',
        specialist: 'Neurologist',
        severity: 'Medium',
        solution: 'Avoid known sensory triggers, maintain regular sleep schedules, avoid caffeine withdrawal, and take prescribed anti-migraine medication.'
    },
    'chest pain': {
        disease: 'Angina Pectoris / Cardiac Alert',
        specialist: 'Cardiologist',
        severity: 'High',
        solution: 'IMMEDIATE ACTION: Stop all physical activity immediately, sit upright in a comfortable position, stay calm, and contact emergency medical services right away.'
    },
    'heart': {
        disease: 'Cardiovascular Evaluation Required',
        specialist: 'Cardiologist',
        severity: 'High',
        solution: 'Avoid physical exertion, monitor blood pressure and pulse rate, and seek urgent clinical evaluation by a cardiologist.'
    },
    'stomach pain': {
        disease: 'Gastritis / Peptic Acid Reflux',
        specialist: 'Gastroenterologist',
        severity: 'Medium',
        solution: 'Avoid spicy, oily, and highly acidic food. Eat small frequent bland meals, drink plenty of water, and avoid lying down right after meals.'
    },
    'acid reflux': {
        disease: 'Gastroesophageal Reflux Disease (GERD)',
        specialist: 'Gastroenterologist',
        severity: 'Medium',
        solution: 'Elevate your head while sleeping, avoid late-night eating, cut down coffee and carbonated drinks, and take antacids if recommended.'
    },
    'skin rash': {
        disease: 'Contact Dermatitis / Urticaria',
        specialist: 'Dermatologist',
        severity: 'Low',
        solution: 'Keep the area clean and dry. Apply gentle fragrance-free moisturizer or calamine lotion. Avoid scratching or hot showers.'
    },
    'acne': {
        disease: 'Acne Vulgaris',
        specialist: 'Dermatologist',
        severity: 'Low',
        solution: 'Wash face gently twice daily with mild cleanser, avoid touching or squeezing spots, and use non-comedogenic skincare products.'
    },
    'joint pain': {
        disease: 'Osteoarthritis / Rheumatoid Flare',
        specialist: 'Orthopedic',
        severity: 'Medium',
        solution: 'Apply hot or cold compress for 15-minute intervals, perform gentle range-of-motion stretching, avoid heavy weight lifting, and rest joints.'
    },
    'knee pain': {
        disease: 'Meniscus Strain / Patellofemoral Pain',
        specialist: 'Orthopedic',
        severity: 'Medium',
        solution: 'Follow R.I.C.E. (Rest, Ice, Compression, Elevation), wear supportive footwear, avoid deep squatting, and consult an orthopedic surgeon.'
    },
    'vision blur': {
        disease: 'Refractive Error / Cataract / Retinal Issue',
        specialist: 'Ophthalmologist',
        severity: 'Medium',
        solution: 'Rest your eyes frequently (20-20-20 rule), ensure adequate illumination while reading, protect eyes from direct sunlight, and schedule an ophthalmic exam.'
    },
    'eye pain': {
        disease: 'Conjunctivitis / Eye Strain',
        specialist: 'Ophthalmologist',
        severity: 'Low',
        solution: 'Do not rub eyes, wash hands before touching face, avoid wearing contact lenses until checked, and use lubricating artificial tears.'
    },
    'breathlessness': {
        disease: 'Bronchial Asthma / Acute Dyspnea',
        specialist: 'Pulmonologist',
        severity: 'High',
        solution: 'Sit upright, use prescribed quick-relief bronchodilator inhaler, take slow deep breaths, and proceed to an emergency clinic if oxygen saturation drops.'
    },
    'shortness of breath': {
        disease: 'Respiratory Distress',
        specialist: 'Pulmonologist',
        severity: 'High',
        solution: 'Keep airways clear, stay calm in an upright position, ensure adequate ventilation, and seek prompt clinical assessment.'
    },
    'toothache': {
        disease: 'Dental Caries / Pulpitis',
        specialist: 'Dentist',
        severity: 'Low',
        solution: 'Rinse mouth gently with warm salt water, avoid extremely hot or cold foods, and schedule a dental consultation.'
    },
    'anxiety': {
        disease: 'Generalized Anxiety / Stress Episode',
        specialist: 'Psychiatrist',
        severity: 'Medium',
        solution: 'Practice 4-7-8 deep breathing exercises, step outside for fresh air, limit caffeine, and speak with a licensed mental health professional.'
    }
};

const predictDisease = (symptoms) => {
    if (!symptoms || typeof symptoms !== 'string') {
        return {
            disease: 'General Consultation Needed',
            specialist: 'General Physician',
            severity: 'Low',
            solution: 'Please provide detailed symptoms for a more specific health recommendation.'
        };
    }

    const lowerSymptoms = symptoms.toLowerCase();
    let bestMatch = null;
    let longestMatchLen = 0;

    for (const [key, value] of Object.entries(symptomData)) {
        if (lowerSymptoms.includes(key)) {
            // Prioritize longer key matches (e.g. "shortness of breath" over "breath")
            if (key.length > longestMatchLen) {
                longestMatchLen = key.length;
                bestMatch = value;
            }
        }
    }

    if (!bestMatch) {
        return {
            disease: 'Undifferentiated Condition',
            specialist: 'General Physician',
            severity: 'General',
            solution: 'Symptoms require comprehensive physical assessment. We recommend scheduling an appointment with a General Physician for full clinical diagnosis.'
        };
    }

    return bestMatch;
};

module.exports = predictDisease;
