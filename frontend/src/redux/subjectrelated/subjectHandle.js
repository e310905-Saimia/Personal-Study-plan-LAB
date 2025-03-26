import axios from 'axios';
import { getRequest, getSuccess, getFailed } from './subjectSlice';

const API_BASE_URL = "http://localhost:5000/api/subjects";

const parseDecimalValue = (value) => {
    if (value === undefined || value === null) return null;
    
    // Handle both comma and period as decimal separators
    const valueStr = typeof value === 'string' ? value.trim() : String(value);
    const normalizedValue = valueStr.replace(',', '.');
    
    // Parse the normalized value
    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? null : parsed;
};

export const addSubject = (subjectData) => async (dispatch) => {
    try {
        const response = await axios.post(API_BASE_URL, subjectData);
        dispatch(getSubjectList()); 
        
        // Return the data in a consistent structure
        return response.data;
    } catch (error) {
        console.error("Error adding subject:", error);
        
        // Create a proper error object
        const addSubjectError = new Error(error.response?.data?.message || "Failed to add subject");
        addSubjectError.isDuplicate = error.response?.status === 409;
        addSubjectError.status = error.response?.status;
        addSubjectError.existingSubject = error.response?.data?.existingSubject;
        
        if (error.response?.status === 409) {
            dispatch(getFailed(addSubjectError.message || "A subject with this name already exists"));
        } else {
            dispatch(getFailed(addSubjectError.message));
        }
        
        throw addSubjectError;
    }
};

export const getSubjectDetails = (subjectID) => async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${subjectID}`);
        return response.data;
    } catch (error) {
        const detailsError = new Error(error.response?.data?.message || "Failed to fetch subject details");
        detailsError.status = error.response?.status;
        console.error("Error fetching subject details:", detailsError);
        throw detailsError;
    }
};

export const getSubjectList = () => async (dispatch) => {
    dispatch(getRequest());
    try {
        const response = await axios.get(API_BASE_URL);
        
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
        const listError = new Error(error.response?.data?.message || "Failed to fetch subjects");
        listError.status = error.response?.status;
        dispatch(getFailed(listError.message));
    }
};

export const updateSubject = (subjectID, updatedData) => async (dispatch) => {
    try {
        await axios.put(`${API_BASE_URL}/${subjectID}`, updatedData);
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        console.error("Error updating subject:", error);
        
        // Create a proper error object
        const updateError = new Error(error.response?.data?.message || "Failed to update subject");
        updateError.isDuplicate = error.response?.status === 409;
        updateError.status = error.response?.status;
        
        if (error.response?.status === 409) {
            dispatch(getFailed(updateError.message || "Cannot update: another subject with this name already exists"));
        } else {
            dispatch(getFailed(updateError.message));
        }
        
        throw updateError;
    }
};

export const deleteSubject = (subjectID) => async (dispatch) => {
    try {
        await axios.delete(`${API_BASE_URL}/${subjectID}`);
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        const deleteError = new Error(error.message || "Failed to delete subject");
        deleteError.status = error.response?.status;
        console.error("Error deleting subject:", deleteError);
        dispatch(getFailed(deleteError.message));
        throw deleteError;
    }
};

export const addOutcome = (subjectID, outcomeData) => async (dispatch) => {
    try {
      // Process the outcomeData to ensure consistent format
      const processedOutcomeData = { ...outcomeData };
      
      // Ensure compulsory is a boolean before sending
      processedOutcomeData.compulsory = String(outcomeData.compulsory) === 'true' || outcomeData.compulsory === true;
      
      // Handle comma decimal separators for credits
      if (outcomeData.credits !== undefined) {
        const parsedCredits = parseDecimalValue(outcomeData.credits);
        
        // Apply validation (min 0.1, max 10)
        if (parsedCredits !== null) {
          processedOutcomeData.credits = Math.max(0.1, Math.min(parsedCredits, 10));
        } else {
          processedOutcomeData.credits = 0.1; // Default
        }
      }
      
      // Same for maxCredits if present
      if (outcomeData.maxCredits !== undefined) {
        const parsedMaxCredits = parseDecimalValue(outcomeData.maxCredits);
        
        if (parsedMaxCredits !== null) {
          processedOutcomeData.maxCredits = Math.max(0.1, Math.min(parsedMaxCredits, 10));
        } else {
          processedOutcomeData.maxCredits = processedOutcomeData.credits || 0.1;
        }
      }
      
      // Ensure requirements is a properly formatted array
      if (outcomeData.requirements !== undefined) {
        if (!Array.isArray(outcomeData.requirements)) {
          // If it's not an array, try to convert it
          let reqArray = [];
          if (typeof outcomeData.requirements === 'string') {
            if (outcomeData.requirements.includes('\n')) {
              reqArray = outcomeData.requirements.split('\n');
            } else if (outcomeData.requirements.includes(',')) {
              reqArray = outcomeData.requirements.split(',');
            } else {
              reqArray = [outcomeData.requirements];
            }
          }
          processedOutcomeData.requirements = reqArray
            .map(req => req.trim())
            .filter(req => req.length > 0);
        } else {
          // If it's already an array, just filter out empty items
          processedOutcomeData.requirements = outcomeData.requirements
            .map(req => req.trim ? req.trim() : req)
            .filter(req => req && (typeof req === 'string' ? req.length > 0 : true));
        }
        console.log("Requirements after processing:", processedOutcomeData.requirements);
      }
      
      console.log("Sending processed outcome data to API:", processedOutcomeData);
      
      const response = await axios.post(`${API_BASE_URL}/${subjectID}/outcomes`, processedOutcomeData);
      
      // If requirements were provided but not included in the initial request (due to API limitation),
      // update the outcome immediately after creation to add requirements
      if (processedOutcomeData.requirements && 
          processedOutcomeData.requirements.length > 0 && 
          response.data && 
          response.data.subject && 
          response.data.subject.outcomes) {
          
        // Get the ID of the newly created outcome (last one in the array)
        const newOutcomes = response.data.subject.outcomes;
        const newOutcomeId = newOutcomes[newOutcomes.length - 1]._id;
        
        if (newOutcomeId) {
          console.log(`Updating newly created outcome ${newOutcomeId} to add requirements:`, 
            processedOutcomeData.requirements);
            
          await axios.put(
            `${API_BASE_URL}/${subjectID}/outcomes/${newOutcomeId}`, 
            { 
              requirements: processedOutcomeData.requirements,
              compulsory: processedOutcomeData.compulsory
            }
          );
        }
      }
      
      dispatch(getSubjectList()); 
      return response.data;
    } catch (error) {
      console.error("Error adding outcome:", error);
      
      // Create a proper error object
      const addOutcomeError = new Error(error.response?.data?.message || "Failed to add outcome");
      addOutcomeError.isDuplicate = error.response?.status === 409;
      addOutcomeError.status = error.response?.status;
      addOutcomeError.outcome = error.response?.data?.outcome;
      
      if (error.response?.status === 409) {
        dispatch(getFailed(addOutcomeError.message || "An outcome with this topic and project already exists"));
      } else {
        dispatch(getFailed(addOutcomeError.message));
      }
      
      throw addOutcomeError;
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
      
      // Handle comma decimal separators for credits
      if (updatedOutcome.credits !== undefined) {
        const parsedCredits = parseDecimalValue(updatedOutcome.credits);
        
        // Apply validation (min 0.1, max 10)
        if (parsedCredits !== null) {
          processedOutcome.credits = Math.max(0.1, Math.min(parsedCredits, 10));
        }
      }
      
      // Same for maxCredits if present
      if (updatedOutcome.maxCredits !== undefined) {
        const parsedMaxCredits = parseDecimalValue(updatedOutcome.maxCredits);
        
        if (parsedMaxCredits !== null) {
          processedOutcome.maxCredits = Math.max(0.1, Math.min(parsedMaxCredits, 10));
        }
      }
  
      // Ensure requirements is a properly formatted array
      if (updatedOutcome.requirements !== undefined) {
        if (!Array.isArray(updatedOutcome.requirements)) {
          // If it's not an array, try to convert it
          let reqArray = [];
          if (typeof updatedOutcome.requirements === 'string') {
            if (updatedOutcome.requirements.includes('\n')) {
              reqArray = updatedOutcome.requirements.split('\n');
            } else if (updatedOutcome.requirements.includes(',')) {
              reqArray = updatedOutcome.requirements.split(',');
            } else {
              reqArray = [updatedOutcome.requirements];
            }
          }
          processedOutcome.requirements = reqArray
            .map(req => req.trim())
            .filter(req => req.length > 0);
        } else {
          // If it's already an array, just filter out empty items
          processedOutcome.requirements = updatedOutcome.requirements
            .map(req => req.trim ? req.trim() : req)
            .filter(req => req && (typeof req === 'string' ? req.length > 0 : true));
        }
        console.log("Requirements after processing:", processedOutcome.requirements);
      }
      
      const response = await axios.put(
        `${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}`,
        processedOutcome
      );
      
      console.log("API response:", response.data);
      
      dispatch(getSubjectList());
      return response.data;
    } catch (error) {
      console.error("Error updating outcome:", error);
      
      // Create a proper error object
      const updateOutcomeError = new Error(error.response?.data?.message || "Failed to update outcome");
      updateOutcomeError.isDuplicate = error.response?.status === 409;
      updateOutcomeError.status = error.response?.status;
      updateOutcomeError.outcome = error.response?.data?.outcome;
      
      if (error.response?.status === 409) {
        dispatch(getFailed(updateOutcomeError.message || "Cannot update: another outcome with this topic and project already exists"));
      } else {
        dispatch(getFailed(updateOutcomeError.message));
      }
      
      throw updateOutcomeError;
    }
  };

export const deleteOutcome = (subjectID, outcomeID) => async (dispatch) => {
    try {
        await axios.delete(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}`);
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        const deleteError = new Error(error.message || "Failed to delete outcome");
        deleteError.status = error.response?.status;
        console.error("Error deleting outcome:", deleteError);
        dispatch(getFailed(deleteError.message));
        throw deleteError;
    }
};

export const addRequirement = (subjectID, outcomeID, requirement) => async (dispatch) => {
    try {
        await axios.post(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}/requirements`, { requirement });
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        const requirementError = new Error(error.message || "Failed to add requirement");
        requirementError.status = error.response?.status;
        console.error("Error adding requirement:", requirementError);
        dispatch(getFailed(requirementError.message));
        throw requirementError;
    }
};

export const editRequirement = (subjectID, outcomeID, requirementIndex, newRequirement) => async (dispatch) => {
    try {
        await axios.put(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}/requirements`, { requirementIndex, newRequirement });
        dispatch(getSubjectList());
        return true;
    } catch (error) {
        const editRequirementError = new Error(error.message || "Failed to update requirement");
        editRequirementError.status = error.response?.status;
        console.error("Error updating requirement:", editRequirementError);
        dispatch(getFailed(editRequirementError.message));
        throw editRequirementError;
    }
};

export const addProject = (subjectID, outcomeID, projectData) => async (dispatch) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${subjectID}/outcomes/${outcomeID}/projects`, projectData);
        dispatch(getSubjectList());
        return response.data;
    } catch (error) {
        const projectError = new Error(error.message || "Failed to add project");
        projectError.status = error.response?.status;
        console.error("Error adding project:", projectError);
        dispatch(getFailed(projectError.message));
        throw projectError;
    }
};

export const bulkImportSubjects = (subjects) => async (dispatch) => {
    try {
        dispatch(getRequest());
        
        const added = [];
        const updated = [];
        const failed = [];
        
        for (const subject of subjects) {
            try {
                const existingSubjectsResponse = await axios.get(API_BASE_URL);
                const existingSubjects = existingSubjectsResponse.data;
                
                const existingSubject = existingSubjects.find(existing => 
                    existing.name.toLowerCase() === subject.name.toLowerCase()
                );
                
                let subjectId;
                
                if (existingSubject) {
                    await axios.put(`${API_BASE_URL}/${existingSubject._id}`, {
                        name: subject.name,
                        credits: subject.credits
                    });
                    subjectId = existingSubject._id;
                    updated.push(subject.name);
                } else {
                    const subjectResponse = await axios.post(API_BASE_URL, {
                        name: subject.name,
                        credits: subject.credits
                    });
                    
                    subjectId = subjectResponse.data.subject._id;
                    added.push(subject.name);
                }
                
                if (subject.outcomes && subject.outcomes.length > 0) {
                    let existingOutcomes = [];
                    if (existingSubject) {
                        const subjectDetails = await axios.get(`${API_BASE_URL}/${subjectId}`);
                        existingOutcomes = subjectDetails.data.outcomes || [];
                    }
                    
                    for (const outcome of subject.outcomes) {
                        try {
                            const compulsoryValue = String(outcome.compulsory) === 'true' || outcome.compulsory === true;
                            
                            // Parse credits with comma support
                            const parsedCredits = parseDecimalValue(outcome.credits);
                            const validCredits = parsedCredits !== null ? 
                                Math.max(0.1, Math.min(parsedCredits, 10)) : 0.1;
                                
                            // Parse maxCredits if present
                            let validMaxCredits = validCredits;
                            if (outcome.maxCredits !== undefined) {
                                const parsedMaxCredits = parseDecimalValue(outcome.maxCredits);
                                if (parsedMaxCredits !== null) {
                                    validMaxCredits = Math.max(0.1, Math.min(parsedMaxCredits, 10));
                                }
                            }
                            
                            const existingOutcome = existingOutcomes.find(existing => 
                                existing.topic.toLowerCase() === outcome.topic.toLowerCase() &&
                                existing.project.toLowerCase() === outcome.project.toLowerCase()
                            );
                            
                            if (existingOutcome) {
                                await axios.put(
                                    `${API_BASE_URL}/${subjectId}/outcomes/${existingOutcome._id}`,
                                    {
                                        topic: outcome.topic,
                                        project: outcome.project,
                                        credits: validCredits,
                                        maxCredits: validMaxCredits,
                                        compulsory: compulsoryValue,
                                        requirements: outcome.requirements || []
                                    }
                                );
                            } else {
                                const outcomeResponse = await axios.post(
                                    `${API_BASE_URL}/${subjectId}/outcomes`,
                                    {
                                        topic: outcome.topic,
                                        project: outcome.project,
                                        credits: validCredits,
                                        maxCredits: validMaxCredits,
                                        compulsory: compulsoryValue
                                    }
                                );
                                
                                if (outcome.requirements && outcome.requirements.length > 0) {
                                    const newOutcomeId = outcomeResponse.data.subject.outcomes[
                                        outcomeResponse.data.subject.outcomes.length - 1
                                    ]._id;
                                    
                                    await axios.put(
                                        `${API_BASE_URL}/${subjectId}/outcomes/${newOutcomeId}`,
                                        { 
                                            requirements: outcome.requirements,
                                            compulsory: compulsoryValue 
                                        }
                                    );
                                }
                            }
                        } catch (outcomeError) {
                            console.error(`Error with outcome ${outcome.topic} for subject ${subject.name}:`, outcomeError);
                        }
                    }
                }
            } catch (subjectError) {
                console.error(`Error with subject ${subject.name}:`, subjectError);
                failed.push(subject.name);
            }
        }
        
        dispatch(getSubjectList());
        
        return {
            success: true,
            stats: {
                added: added.length,
                updated: updated.length,
                failed: failed.length
            },
            addedSubjects: added,
            updatedSubjects: updated,
            failedSubjects: failed
        };
    } catch (error) {
        const bulkImportError = new Error(error.message || "Failed to import subjects");
        bulkImportError.status = error.response?.status;
        console.error("Error in bulk import:", bulkImportError);
        dispatch(getFailed(bulkImportError.message));
        throw bulkImportError;
    }
};