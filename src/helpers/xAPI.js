/**
 * Helper functions for xAPI events
 */

/**
 * Packs the current state of the users interactivity into a serializable object.
 *
 * @param {Object[][]} currentCategoryAssignement Array describing which text items are in each category
 */
export function getCurrentState(currentCategoryAssignement) {
  return { answers: getResponse(currentCategoryAssignement) };
}

/**
 * Retrieves the xAPI data necessary for generating result reports
 *
 * @param {object} app Multi media choice object
 * @param {string} question Question text
 * @param {object[]} textGroups Array containing categories and their text items
 * @param {number} score Score given for answering the question
 * @param {number} maxScore Maximum possible score that can be achieved for the question
 * @param {boolean} success True if the task was passed according to passPercentage
 */
export function getXAPIData(app, question, textGroups, score, maxScore, success) {
  const xAPIEvent = getAnsweredXAPIEvent(app, question, textGroups, score, maxScore, success);
  return { statement: xAPIEvent.data.statement };
}

/**
 * Generates the xAPI event for answered.
 *
 * @param {object} app Text Grouping object
 * @param {string} question Question text
 * @param {object[]} textGroups Array containing categories and their text items
 * @param {number} score Score given for answering the question
 * @param {number} maxScore Maximum possible score that can be achieved for the question
 * @param {boolean} success True if the task was passed according to passPercentage
 * @param {Object[][]} currentCategoryAssignement Array describing which text items are in each category
 */
export function getAnsweredXAPIEvent(
  app,
  question,
  textGroups,
  score,
  maxScore,
  success,
  currentCategoryAssignement
) {
  const xAPIEvent = app.createXAPIEventTemplate('answered');

  addQuestionToXAPI(xAPIEvent, textGroups, question);
  xAPIEvent.setScoredResult(score, maxScore, app, true, success);
  xAPIEvent.data.statement.result.response = getResponse(currentCategoryAssignement);
  return xAPIEvent;
}

/**
 * Adds the question to the definition part of an xAPIEvent
 *
 * @param {H5P.XAPIEvent} xAPIEvent to add a question to
 * @param {object[]} textGroups Array containing categories and their text items
 * @param {string} question Question text
 */
function addQuestionToXAPI(xAPIEvent, textGroups, question) {
  const definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
  definition.description = {
    'en-US': htmlDecode(question)
  };
  definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
  definition.interactionType = 'matching';

  // Add source, target and correct response pattern
  const source = [];
  const target = [];
  let correctResponsePattern = '';
  textGroups.forEach((category, categoryId) => {
    target.push({
      id: categoryId,
      description: {
        'en-US': htmlDecode(category.groupName)
      }
    });

    category.textElements.forEach((textItem, textItemId) => {
      const textItemStringId = `${categoryId}${textItemId}`;
      source.push({
        id: textItemStringId,
        description: {
          'en-US': htmlDecode(textItem)
        }
      });

      if (correctResponsePattern) {
        correctResponsePattern += '[,]'; // Deliminator
      }
      correctResponsePattern += textItemStringId + '[.]' + categoryId;
    });
  });

  definition.source = source;
  definition.target = target;
  definition.correctResponsePattern = [correctResponsePattern];
}

/**
 * Adds the response to the definition part of an xAPIEvent
 *
 * @param {H5P.XAPIEvent} xAPIEvent to add a response to
 * @param {Object[][]} currentCategoryAssignement Array describing which text items are in each category
 */
function getResponse(currentCategoryAssignement) {
  let response = '';
  currentCategoryAssignement.forEach((category, categoryId) => {
    category.forEach((textItem) => {
      if (response) {
        response += '[,]'; // Deliminator
      }
      response += textItem.id + '[.]' + categoryId;
    });
  });

  return response;
}

/**
 * Get plain text
 *
 * @param {String} html
 */
const htmlDecode = (html) => {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.textContent.trim();
};

export default { getXAPIData, getCurrentState, getAnsweredXAPIEvent };
