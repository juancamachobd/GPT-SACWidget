(function () {
  let template = document.createElement("template");
  template.innerHTML = `
      <style>
        :host {}
  
  /* Style for the container */
  div {
    margin: 50px auto;
    max-width: 600px;
  }
  
  /* Style for the input container */
  .input-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  /* Style for the input field */
  #prompt-input {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 70%;
  }
  
  /* Style for the button */
  #generate-button {
    padding: 10px;
    font-size: 16px;
    background-color: #3cb6a9;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 25%;
  }
  
  /* Style for the generated text area */
  #generated-text {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
  width:96%;
  }
      </style>
     <div>
  <center>
  <img src="https://1000logos.net/wp-content/uploads/2023/02/ChatGPT-Emblem.png" width="200"/>
  <h1>ChatGPT</h1></center>
    <div class="input-container">
      <input type="text" id="prompt-input" placeholder="Enter a prompt">
      <button id="generate-button">Generate Text</button>
    </div>
    <textarea id="generated-text" rows="10" cols="50" readonly></ textarea>
  </div>
    `;
  class Widget extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({
        mode: "open"
      });
      shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {};
    }
    async connectedCallback() {
      this.initMain();
    }
    async initMain() {
      const generatedText = this.shadowRoot.getElementById("generated-text");
      generatedText.value = "";
      const {
        apiKey
      } = this._props || "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";
      const {
        max_tokens
      } = this._props || 1024;
      const generateButton = this.shadowRoot.getElementById("generate-button");
      generateButton.addEventListener("click", async () => {
      const promptInput = this.shadowRoot.getElementById("prompt-input");
      const generatedText = this.shadowRoot.getElementById("generated-text");
      // Clear previous results
      generatedText.value = "Finding result...";  
      try {
        const prompt = promptInput.value;
        if (!prompt.trim()) {
          generatedText.value = "Please enter a valid prompt.";
          return;
        }
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a helpful strategic management assistant." },
              { role: "user", content: prompt }
            ],
            max_tokens: parseInt(max_tokens),
            n: 1,
            temperature: 0.8
          })
        });    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${errorData.error.message}`);
        }
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          const generatedTextValue = data.choices[0].message.content;
          generatedText.value = generatedTextValue.replace(/\n/g, ''); // Remove newlines for better display
        } else {
          generatedText.value = "No response received from the API.";
        }
        } catch (error) {
          console.error("Error:", error.message);
          generatedText.value = `An error occurred: ${error.message}`;
        }
      });
    }
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = {
        ...this._props,
        ...changedProperties
      };
    }
    onCustomWidgetAfterUpdate(changedProperties) {
      this.initMain();
    }
  }
  customElements.define("com-jcamacho-sap-chatgptwidget", Widget);
})();
