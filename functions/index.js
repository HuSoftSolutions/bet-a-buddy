/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Cloud Function to award points when a new match result is created
exports.awardPointsForCompletedMatch = onDocumentCreated('matchResults/{resultId}', async (event) => {
  try {
    const resultData = event.data.data();
    const resultId = event.params.resultId;
    const matchId = resultData.matchId;
    
    // Check if points have already been awarded for this match result
    if (resultData.pointsAwarded) {
      logger.info(`Points already awarded for match ${matchId}, skipping`);
      return;
    }
    
    logger.info(`Processing points award for match ${matchId} (result ${resultId})`);
    
    // Award points to each participant
    const participants = resultData.participants || [];
    const pointsPromises = participants.map(async (userId) => {
      try {
        // Check if user has already received points for this match
        const existingPoints = await db.collection('pointsHistory')
          .where('userId', '==', userId)
          .where('matchId', '==', matchId)
          .get();
          
        if (!existingPoints.empty) {
          logger.info(`User ${userId} already received points for match ${matchId}`);
          return null;
        }
        
        // Award points (base points for participation)
        const pointsToAward = 10;
        
        // Use transaction for atomic updates
        return db.runTransaction(async (transaction) => {
          // Get user document
          const userRef = db.collection('users').doc(userId);
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists) {
            logger.warn(`User ${userId} does not exist, skipping points award`);
            return;
          }
          
          // Create points history record
          const historyRef = db.collection('pointsHistory').doc();
          transaction.set(historyRef, {
            userId,
            matchId,
            points: pointsToAward,
            reason: 'match_completion',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Update user's total points
          const currentPoints = userDoc.data().points || 0;
          transaction.update(userRef, {
            points: currentPoints + pointsToAward
          });
          
          logger.info(`Awarded ${pointsToAward} points to user ${userId} for match ${matchId}`);
        });
      } catch (error) {
        logger.error(`Error awarding points to user ${userId}: ${error.message}`);
        return null;
      }
    });
    
    await Promise.all(pointsPromises.filter(Boolean));
    
    // Mark match result as having had points awarded
    await event.data.ref.update({
      pointsAwarded: true,
      pointsAwardedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Also update the original match document
    await db.collection('matches').doc(matchId).update({
      pointsAwarded: true
    });
    
    logger.info(`Successfully awarded points for match ${matchId}`);
  } catch (error) {
    logger.error(`Error awarding points for match result: ${error.message}`);
  }
});
