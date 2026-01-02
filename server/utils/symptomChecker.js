const symptomData = {
    'fever': { disease: 'Viral Infection', specialist: 'General Physician', severity: 'Low', solution: 'Stay hydrated, take rest, and monitor temperature. Consult a doctor if fever persists > 3 days.' },
    'cough': { disease: 'Common Cold', specialist: 'General Physician', severity: 'Low', solution: 'Drink warm fluids, salt water gargle, and steam inhalation. Avoid cold beverages.' },
    'headache': { disease: 'Migraine', specialist: 'Neurologist', severity: 'Medium', solution: 'Rest in a quiet dark room, apply cold compress, and stay hydrated. Avoid loud noises.' },
    'chest pain': { disease: 'Angina', specialist: 'Cardiologist', severity: 'High', solution: 'IMMEDIATE ACTION: Stop all activity, sit down, and relax. If pain persists > 10 mins, call emergency.' },
    'stomach pain': { disease: 'Gastritis', specialist: 'Gastroenterologist', severity: 'Medium', solution: 'Avoid spicy/oily food, eat small bland meals, and drink water. Avoid empty stomach.' },
    'skin rash': { disease: 'Dermatitis', specialist: 'Dermatologist', severity: 'Low', solution: 'Keep area clean and dry. Apply moisturizer or soothing lotion. Avoid scratching.' },
    'joint pain': { disease: 'Arthritis', specialist: 'Orthopedic', severity: 'Medium', solution: 'Apply hot/cold pack, gentle stretching exercises. Avoid heavy weight lifting.' },
    'vision blur': { disease: 'Cataract', specialist: 'Ophthalmologist', severity: 'Medium', solution: 'Use bright lights for reading. Protect eyes from UV. Schedule an eye exam.' },
    'breathlessness': { disease: 'Asthma/Resp. Issue', specialist: 'Pulmonologist', severity: 'High', solution: 'Sit upright, use inhaler if prescribed. seek medical help if breathing difficulty increases.' },
};

const predictDisease = (symptoms) => {
    // Simple logic: check if any keyword exists in input
    const lowerSymptoms = symptoms.toLowerCase();
    let result = null;

    for (const [key, value] of Object.entries(symptomData)) {
        if (lowerSymptoms.includes(key)) {
            result = value;
            break; // Return first match for simplicity
        }
    }

    if (!result) {
        return {
            disease: 'Unknown Condition',
            specialist: 'General Physician',
            severity: 'Unknown - Please consult a doctor',
            solution: 'Symptoms are unclear. We highly recommend consulting a General Physician for a proper checkup.'
        };
    }
    return result;
};

module.exports = predictDisease;
