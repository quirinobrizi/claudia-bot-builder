'use strict';

class SimpleResponseBuilder {

  asSsml() {
    this.isSsml = true;
  }

  setTextToSpeech(text) {
    this.textToSpeech = text;
    return this;
  }

  setDisplayText(text) {
    this.displayText = text;
    return this;
  }

  done() {
    return {
      type: 'simpleResponse',
      simpleResponse: {
        textToSpeech: !this.isSsml ? this.textToSpeech : undefined,
        ssml: this.isSsml ? this.textToSpeech : undefined,
        displayText: this.displayText
      }
    };
  }
}

class BasicCardBuilder {

  constructor() {
    this.buttons = [];
  }

  setImage(url, accessibilityText) {
    this.image = {
      url: url,
      accessibilityText: accessibilityText
    };
    return this;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  setSubTitle(subTitle) {
    this.subTitle = subTitle;
    return this;
  }

  setTextBody(textBody) {
    this.textBody = textBody;
    return this;
  }

  addButton(title, url) {
    this.buttons.push({
      title: title,
      openUrlAction: {
        url: url
      }
    });
    return this;
  }

  setImageDisplayOptions(option) {
    this.imageDisplayOptions = option;
    return this;
  }

  done() {
    return {
      type: 'basicCard',
      title: this.title,
      formattedText: this.textBody,
      image: this.image,
      buttons: this.buttons,
      imageDisplayOptions: this.imageDisplayOptions
    }
  }
}

class BrowsingCarouselItemBuilder {

  constructor(parent) {
    this.parent = parent;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  setFooter(footer) {
    this.footer = footer;
    return this;
  }

  setImage(url, accessibilityText) {
    this.image = {
      url: url,
      accessibilityText: accessibilityText
    };
    return this;
  }

  setOpenUrlAction(url) {
    this.openUrlAction = {
      url: url
    };
    return this;
  }

  done() {
    this.parent.items.push({
      title: this.title,
      description: this.description,
      footer: this.footer,
      image: this.image,
      openUrlAction: this.openUrlAction
    });
    return this.parent;
  }
}

class BrowsingCarouselBuilder {

  constructor() {
    this.items = [];
  }

  addItem() {
    return new BrowsingCarouselItemBuilder(this);
  }

  done() {
    return {
      type: 'browsingCarousel',
      carouselBrowse: {
        items: this.items
      }
    };
  }
}

class GoogleTemplate {

  constructor() {
    this.template = {
      conversationToken: {},
      userStorage: '',
      resetUserStorage: false,
      expectUserResponse: false,
      expectedInputs: [],
      finalResponse: {},
      customPushMessage: {},
      isInSandbox: false
    };
  }

  /**
   * Ask a question to the user
   * @param {Array<Object>} items the question items to ask to the user.
   *  {
   *     "speech": "the spoken text",
   *     "displayText": "the text displayed on the screen"
   *  }
   * @param {Array<Object>} noInputs Prompt used to ask user when there is no input from user.
   *  {
   *     "speech": "the spoken text",
   *     "displayText": "the text displayed on the screen"
   *  }
   * @deprecated
   */
  ask(items, noInputs) {
    if (this.template.expectUserResponse) {
      this.template.expectedInputs.push({
        inputPrompt: this._buildInputPrompt(false, items, []),
        possibleIntents: [{
          intent: "actions.intent.TEXT"
        }]
      });
      delete this.template.finalResponse;
    } else {
      // should set finalResponse
      this.template.finalResponse = {
        richResponse: this._buildRichResponse(false, items)
      };
      delete this.template.expectedInputs;
    }
    return this;
  }

  /**
   * Ask a question to the user and expect a response. the information provided should respect the SSML format.
   * @param {Array<Object>} items the question items to ask to the user.
   *  {
   *     "speech": "the spoken text",
   *     "displayText": "the text displayed on the screen"
   *  }
   * @param {Array<Object>} noInputs Prompt used to ask user when there is no input from user.
   *  {
   *     "speech": "the spoken text",
   *     "displayText": "the text displayed on the screen"
   *  }
   * @deprecated
   */
  askSsml(items, noInputs) {
    if (this.template.expectUserResponse) {
      this.template.expectedInputs.push({
        inputPrompt: this._buildInputPrompt(true, items, []),
        possibleIntents: [{
          intent: "actions.intent.TEXT"
        }]
      });
      delete this.template.finalResponse;
    } else {
      // should set finalResponse
      this.template.finalResponse = {
        richResponse: this._buildRichResponse(true, items)
      };
      delete this.template.expectedInputs;
    }
    return this;
  }

  /**
   * Provide access to SimpleResponseBuilder.
   */
  simpleResponseBuilder() {
    return new SimpleResponseBuilder(this);
  }

  /**
   * Provide access to BasicCardBuilder.
   */
  basicCardBuilder() {
    return new BasicCardBuilder();
  }

  /**
   * Provide access to BrowsingCarouselBuilder.
   */
  browsingCarouselBuilder() {
    return new BrowsingCarouselBuilder();
  }

  /**
   * allows to define the response items that will be presented to the user.
   * @example 
   * let template = new GoogleTemplate();
   * template().present([
   *   template.simpleResponseBuilder().setTextToSpeech('hello').done(),
   *   template.basicCardBuilder().setTitle('Title').setImage('http://my.image').addButton('Read Me', 'http://read.me').done()
   * ]);
   * template.get();
   * @param {Array<Object} items the rresponse items to present to the user
   */
  present(items) {
    if (this.template.expectUserResponse) {
      this.template.expectedInputs.push({
        inputPrompt: this._buildInputPrompt(false, items, []),
        possibleIntents: [{
          intent: "actions.intent.TEXT"
        }]
      });
      delete this.template.finalResponse;
    } else {
      // should set finalResponse
      this.template.finalResponse = {
        richResponse: this._buildRichResponse(false, items)
      };
      delete this.template.expectedInputs;
    }
    return this;
  }

  /**
   * Add suggestions to the response
   * @param {Array<String>} suggestions the seggestions to provide to the user
   * @see https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#Suggestion
   */
  suggestions(suggestions) {
    let richResponse = this._getRichResponseObject();
    richResponse.suggestions = richResponse.suggestions.concat(suggestions.map(suggestion => {
      return {
        title: suggestion
      }
    }));
    return this;
  }

  /**
   * Add link out suggestions to the response
   * 
   * @param {String} destinationName The name of the app or site this chip is linking to. The chip will be rendered with the title "Open ". Max 20 chars. Required.
   * @param {String} url The url field which could be any of: - http/https urls for opening an App-linked App or a webpage
   * 
   * @see https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#LinkOutSuggestion
   */
  linkOutSuggestion(destinationName, url) {
    if (!destinationName || destinationName.length > 20) {
      throw new Error('invalid detsination name, it must be provided and must be shorter than 20 characters');
    }
    let richResponse = this._getRichResponseObject();
    richResponse.linkOutSuggestion = {
      destinationName: destinationName,
      openUrlAction: {
        url: url
      }
    }
    return this;
  }

  /**
   * Indicates whether the app is expecting a user response. 
   * This is true when the conversation is ongoing, false when the conversation is done.
   * 
   * By default the generated response set this flag to false.
   */
  expectUserResponse() {
    this.template.expectUserResponse = true;
    return this;
  }

  /**
   * Indicates whether the response should be handled in sandbox mode. 
   * This bit is needed to push structured data to Google in sandbox mode.
   */
  sandboxMode() {
    this.template.isInSandbox = true;
    return this;
  }

  /**
   * Allow retrieve the built response
   */
  get() {
    return this.template;
  }

  /**
   * Build the InputPrompt response to send to the user.
   * 
   * @see https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#InputPrompt
   * @param {Boolean} isSsml flag indicating if the prompt is SSML
   * @param {Any} prompt the prompt message for the user
   * @param {Array<Any>} noInputs Prompt used to ask user when there is no input from user.
   */
  _buildInputPrompt(isSsml, prompts, noInputs) {
    return {
      richInitialPrompt: this._buildRichResponse(isSsml, prompts),
      noInputPrompts: noInputs.reduce((answer, prompt) => {
        answer.push({
          textToSpeech: !isSsml ? prompt.textToSpeech : undefined,
          ssml: isSsml ? prompt.speech : undefined,
          displayText: prompt.displayText
        });
        return answer;
      }, [])
    };
  }

  _buildRichResponse(isSsml, prompts) {
    let richResponse = this._getRichResponseObject();
    richResponse.items = richResponse.items.concat(prompts.reduce((answer, prompt) => {
      if (!prompt.type) {
        answer.push({
          simpleResponse: {
            textToSpeech: !isSsml ? prompt.speech : undefined,
            ssml: isSsml ? prompt.speech : undefined,
            displayText: prompt.displayText
          }
        });
      } else {
        delete prompt.type;
        answer.push(prompt);
      }
      return answer;
    }, []));
    return richResponse;
  }

  _getRichResponseObject() {
    let richResponse = {
      items: [],
      suggestions: [],
      linkOutSuggestion: {}
    };
    if (this.template.expectUserResponse) {
      if (this.template.expectedInputs.length > 0 && this.template.expectedInputs[0].inputPrompt && this.template.expectedInputs[0].inputPrompt.richInitialPrompt) {
        richResponse = this.template.expectedInputs[0].inputPrompt.richInitialPrompt;
        if (!richResponse.items) {
          richResponse.items = [];
        }
        if (!richResponse.suggestions) {
          richResponse.suggestions = [];
        }
        if (!richResponse.linkOutSuggestion) {
          richResponse.linkOutSuggestion = {};
        }
      }
    } else {
      if (this.template.finalResponse && this.template.finalResponse.richResponse) {
        richResponse = this.template.finalResponse.richResponse;
        if (!richResponse.items) {
          richResponse.items = [];
        }
        if (!richResponse.suggestions) {
          richResponse.suggestions = [];
        }
        if (!richResponse.linkOutSuggestion) {
          richResponse.linkOutSuggestion = {};
        }
      }
    }
    return richResponse;
  }

}

module.exports = GoogleTemplate;