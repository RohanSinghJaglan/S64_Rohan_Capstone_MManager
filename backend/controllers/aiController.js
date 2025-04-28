import { getMedicationRecommendations as getLangchainMedicationRecommendations, 
    chatWithMedicalAssistant, 
    clearMemory, 
    getHealthTips as getLangchainHealthTips 
} from '../services/langchainService.js';

// Get medication recommendations based on symptoms
export const getMedicationRecommendations = async (req, res) => {
    try {
        const { symptoms, age, gender, allergies } = req.body;

        if (!symptoms) {
            return res.status(400).json({
                success: false,
                message: 'Symptoms are required'
            });
        }

        if (!age) {
            return res.status(400).json({
                success: false,
                message: 'Patient age is required'
            });
        }

        if (!gender) {
            return res.status(400).json({
                success: false,
                message: 'Patient gender is required'
            });
        }

        const response = await getLangchainMedicationRecommendations(
            symptoms,
            age,
            gender,
            allergies || []
        );

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error in medication recommendations:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate recommendations'
        });
    }
};

// Chat with medical assistant
export const chatWithAssistant = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.userId;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Use user ID if no session ID is provided
        const chatSessionId = sessionId || userId;

        const response = await chatWithMedicalAssistant(
            chatSessionId,
            message
        );

        return res.status(200).json({
            success: true,
            data: {
                message: response,
                sessionId: chatSessionId
            }
        });
    } catch (error) {
        console.error('Error in chat with assistant:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to process message'
        });
    }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const userId = req.user.userId;

        // Use user ID if no session ID is provided
        const chatSessionId = sessionId || userId;

        clearMemory(chatSessionId);

        return res.status(200).json({
            success: true,
            message: 'Chat history cleared'
        });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to clear chat history'
        });
    }
};

// Get personalized health tips
export const getHealthTips = async (req, res) => {
    try {
        const { userProfile } = req.body;

        if (!userProfile) {
            return res.status(400).json({
                success: false,
                message: 'User profile is required'
            });
        }

        const response = await getLangchainHealthTips(userProfile);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error generating health tips:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate health tips'
        });
    }
};

export default {
    getMedicationRecommendations,
    chatWithAssistant,
    clearChatHistory,
    getHealthTips
}; 