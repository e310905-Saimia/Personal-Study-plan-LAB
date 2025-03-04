import axios from 'axios';
import { getRequest, getSuccess, getFailed } from './subjectSlice';

const API_BASE_URL = "http://localhost:5000/api/subjects"; // ✅ Correct base URL


export const addSubject = (subjectData) => async (dispatch) => {
    try {
        const response = await axios.post(API_BASE_URL, subjectData);  // ✅ Corrected endpoint
        dispatch(getSubjectList()); 
        return response.data;
    } catch (error) {
        console.error("Error adding subject:", error);
        dispatch(getFailed(error.message));
        throw error; // Re-throw to allow component to handle error
    }
};

export const getSubjectDetails = (subjectID) => async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${subjectID}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subject details:", error.response?.data?.message || "Failed to fetch subject details");
        throw error;
    }
};

export const getSubjectList = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get("http://localhost:5000/api/subjects");
        
        // Process the data before dispatching to ensure consistent compulsory values
        const processedData = response.data.map(subject => {
            if (subject.outcomes && subject.outcomes.length > 0) {
                return {
                    ...subject,
                    outcomes: subject.outcomes.map(outcome => {
                        // Force the compulsory field to be a true boolean
                        const compulsoryValue = String(outcome.compulsory) === 'true' || outcome.compulsory === true;
                        return {
                            ...outcome,
                            compulsory: compulsoryValue
                        };
                    })
                };
            }
            return subject;
        });
        
        dispatch(getSuccess(processedData));
    } catch (error) {
        dispatch(getFailed(error.response?.data?.message || "Failed to fetch subjects"));
    }
};

// ✅ Update Subject
export const updateSubject = (subjectID, updatedData) => async (dispatch) => {
    try {
        await axios.put(`${API_BASE_URL}/${subjectID}`, updatedData);
        dispatch(getSubjectList()); // Refresh list
        return true; // Indicate success
    } catch (error) {
        console.error("Error updating subject:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

// ✅ Delete Subject
export const deleteSubject = (subjectID) => async (dispatch) => {
    try {
        await axios.delete(`${API_BASE_URL}/${subjectID}`);
        dispatch(getSubjectList()); // Refresh list
        return true;
    } catch (error) {
        console.error("Error deleting subject:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

export const addOutcome = (subjectID, outcomeData) => async (dispatch) => {
    try {
        // Ensure compulsory is a boolean before sending
        const processedOutcomeData = {
            ...outcomeData,
            compulsory: String(outcomeData.compulsory) === 'true' || outcomeData.compulsory === true
        };
        
        const response = await axios.post(`http://localhost:5000/api/subjects/${subjectID}/outcomes`, processedOutcomeData);
        dispatch(getSubjectList()); 
        return response.data;
    } catch (error) {
        console.error("Error adding outcome:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

export const updateOutcome = (subjectID, outcomeID, updatedOutcome) => async (dispatch) => {
    try {
      console.log("updateOutcome action called with:", {
        subjectID,
        outcomeID,
        updatedOutcome
      });
      
      // Make sure compulsory value is correctly processed
      const processedOutcome = { ...updatedOutcome };
      
      if (updatedOutcome.compulsory !== undefined) {
        // Convert to boolean using string comparison for consistency
        processedOutcome.compulsory = String(updatedOutcome.compulsory) === 'true' || updatedOutcome.compulsory === true;
        console.log("Compulsory value after conversion:", processedOutcome.compulsory);
      }
  
      const response = await axios.put(
        `${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}`,
        processedOutcome
      );
      
      console.log("API response:", response.data);
      
      dispatch(getSubjectList());
      return true;
    } catch (error) {
      console.error("Error updating outcome:", error);
      dispatch(getFailed(error.message));
      throw error;
    }
};

export const deleteOutcome = (subjectID, outcomeID) => async (dispatch) => {
    try {
        await axios.delete(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}`);
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        console.error("Error deleting outcome:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

// ✅ Add Requirement to an Outcome
export const addRequirement = (subjectID, outcomeID, requirement) => async (dispatch) => {
    try {
        await axios.post(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}/requirements`, { requirement });
        dispatch(getSubjectList()); // Refresh list
        return true;
    } catch (error) {
        console.error("Error adding requirement:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};

// ✅ Edit an Existing Requirement
export const editRequirement = (subjectID, outcomeID, requirementIndex, newRequirement) => async (dispatch) => {
    try {
        await axios.put(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}/requirements`, { requirementIndex, newRequirement });
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        console.error("Error updating requirement:", error);
        dispatch(getFailed(error.message));
        throw error;
    }
};


export const addProject = (subjectID, outcomeID, projectData) => async (dispatch) => {
    try {
        await axios.post(`http://localhost:5000/api/subjects/${subjectID}/outcomes/${outcomeID}/projects`, projectData);
        dispatch(getSubjectList()); // ✅ Refresh subjects after adding a project
        return true;
    } catch (error) {
        console.error("Error adding project:", error);
        throw error;
    }
};

// New function for bulk import of subjects
export const bulkImportSubjects = (subjects) => async (dispatch) => {
    try {
        dispatch(getRequest());
        
        // Process each subject one by one
        for (const subject of subjects) {
            // 1. Create the subject
            const subjectResponse = await axios.post(API_BASE_URL, {
                name: subject.name,
                credits: subject.credits
            });
            
            const subjectId = subjectResponse.data.subject._id;
            
            // 2. Add outcomes to the subject if there are any
            if (subject.outcomes && subject.outcomes.length > 0) {
                for (const outcome of subject.outcomes) {
                    // Ensure compulsory is a boolean
                    const compulsoryValue = String(outcome.compulsory) === 'true' || outcome.compulsory === true;
                    
                    const outcomeResponse = await axios.post(
                        `${API_BASE_URL}/${subjectId}/outcomes`,
                        {
                            topic: outcome.topic,
                            project: outcome.project,
                            credits: outcome.credits,
                            compulsory: compulsoryValue
                        }
                    );
                    
                    // 3. Add requirements if there are any
                    if (outcome.requirements && outcome.requirements.length > 0) {
                        const outcomeId = outcomeResponse.data.subject.outcomes[
                            outcomeResponse.data.subject.outcomes.length - 1
                        ]._id;
                        
                        await axios.put(
                            `${API_BASE_URL}/${subjectId}/outcomes/${outcomeId}`,
                            { 
                                requirements: outcome.requirements,
                                compulsory: compulsoryValue 
                            }
                        );
                    }
                }
            }
        }
        
        // Refresh the subjects list after bulk import
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        console.error("Error in bulk import:", error);
        dispatch(getFailed(error.message || "Failed to import subjects"));
        throw error;
    }
};