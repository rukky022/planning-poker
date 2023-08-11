import io from 'socket.io-client';

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });
    }

    preload() {

    }

    create() {
        this.isPlayerA = false;
        this.opponentCard = [];

        this.socket = io('http://localhost:3000');

        this.socket.on('connect', function () {
        	console.log('Connected!');
        });

        this.socket.on('isPlayerA', function () {
        	self.isPlayerA = true;
        })

        this.dealText = this.add.text(640, 350, ['Pick a card']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('#002838').setInteractive();
        this.revealCardsButton = this.add.rectangle(680, 360, 180, 80, 0x007cba).setStrokeStyle(2, 0xEEF2F3).setInteractive()
        this.revealText = this.add.text(630, 350, ['Reveal Cards']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('white').setInteractive();
        
        this.revealCardsButton.visible = false;
        this.revealText.visible = false;
        
        let self = this;

        this.playerCard = this.add.rectangle(475, 360, 70, 120, 0xEEF2F3).setStrokeStyle(2, 0xEEF2F3).setData("playerCardValue", "").setInteractive();
        this.playerChoice = this.add.text(465, 350, " ").setFontSize(20).setFontFamily('Trebuchet MS').setColor('black').setAlign('center').setInteractive();

        const cardWords = ['XS', ' S', ' M', ' L', 'XL'];
        this.rectCards = [];
        this.texts = [];

        for (let i = 0; i < 5; i++) {
            let rectCard = this.add.rectangle(475 + (i*120), 560, 80, 120, 0xffffff).setStrokeStyle(2, 0x007cba).setInteractive();
            let text = this.add.text((465+(i*120)), 550, cardWords[i]).setFontSize(20).setFontFamily('Trebuchet MS').setColor('#007cba').setAlign('center').setInteractive();
            
            rectCard.active = false;

            this.texts.push(text);
            this.rectCards.push(rectCard)
        }

        function selectCard(element, corrText) {
            element.setFillStyle(0x007cba);
            element.active = true; 
            corrText.setColor('white');
            self.playerCard.setData("playerCardValue", corrText.text);
            self.playerCard.setFillStyle(0x64828A);
            self.dealText.visible = false;
            self.revealCardsButton.visible = true;
            self.revealText.visible = true;

        }
        
        function deselectCard(element, corrText) {
            element.setFillStyle(0xffffff);
            element.active = false;
            corrText.setColor('#007cba');
            self.playerCard.setData("playerCardValue", "");
            self.playerCard.setFillStyle(0xEEF2F3);
            self.dealText.visible = true;
            self.revealCardsButton.visible = false;
            self.revealText.visible = false;
        }

        function revealCardsButtonOnClick () {
            self.playerCard.setFillStyle(0xEEF2F3);
            self.playerChoice.text = self.playerCard.data.list.playerCardValue; 
        }

        for (let j = 0; j < this.rectCards.length; j++) {
            const element = this.rectCards[j];
            const corrText = this.texts[j];
            element.on('pointerdown', function () {
                if (element.active) {
                    deselectCard(element, corrText);
                } else {
                    if (self.playerCard.data.list.playerCardValue !== "") {
                        const ind = cardWords.indexOf(self.playerCard.data.list.playerCardValue);
                        deselectCard(self.rectCards[ind], self.texts[ind]);
                    }
                    selectCard(element, corrText);
                }
            })
        }

        this.revealCardsButton.on('pointerdown', revealCardsButtonOnClick);
    }

    update() {

    }
}