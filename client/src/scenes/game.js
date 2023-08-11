import io from 'socket.io-client';

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });
    }

    preload() {
        //for loading assets
    }

    create() {
        this.isPlayerA = false;

        // for connecting the server
        this.socket = io('http://localhost:3000');

        this.socket.on('connect', function () {
        	console.log('Connected!');
        });

        this.socket.on('isPlayerA', function () {
        	self.isPlayerA = true;
            console.log("I'm player A")
        })

        // when a player chooses a card
        this.socket.on('cardChosen', function (isPlayerA, playerChoice) {

            //if the player who chose is not you
            if (isPlayerA !== self.isPlayerA) {
                //change the style of the "Other Player" card to dark blue/grey
                self.opponentCard.setFillStyle(0x64828A);
                self.opponentCard.setData("opponentCardValue", playerChoice);

                // show the revealCardsButton instead of "Pick a Card" text
                self.pickACard.visible = false;
                self.revealCardsButton.visible = true;
                self.revealText.visible = true;
            }
        })

        // when a player deselects a card
        this.socket.on('cardDeselected', function(isPlayerA) {
            
            //if the player who deselect is not you
            if (isPlayerA !== self.isPlayerA) {
                //change the style of the "Other Player" card to default
                self.opponentCard.setFillStyle(0xEEF2F3);
                self.opponentCard.setData("opponentCardValue", " ");

                // show the "Pick a Card" text instead of revealCardsButton
                self.pickACard.visible = true;
                self.revealCardsButton.visible = false;
                self.revealText.visible = false;
            }
        })

        // when a player clicks the revealCardsButton
        this.socket.on('revealCards', function() {
            // call the function to show the other player's and your card
            revealCardsButtonOnClick();
        })

        /**
         * attempt to refresh the game after cards are revealed
         * TODO: reset the game in a way that both player are reconnected to the same server
         * currently this function results in them joining again instead of disconnecting 
         * and reconnecting so any new changes won't be reflected
         */
        // this.socket.on('refreshGame', function() {
        //     self.scene.restart();
        // })

        // "Pick a Card" text in center
        this.pickACard = this.add.text(670, 350, ['Pick a card']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('#002838').setInteractive();
        
        // reveal cards button and text
        this.revealCardsButton = this.add.rectangle(720, 360, 180, 80, 0x007cba).setStrokeStyle(2, 0xEEF2F3).setData("revealed", false).setInteractive();
        this.revealText = this.add.text(670, 350, ['Reveal Cards']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('white').setInteractive();
        
        // initially set their visibility to false
        this.revealCardsButton.visible = false;
        this.revealText.visible = false;
        
        let self = this;

        // define t-shirt sizes and arrays
        const cardWords = ['XS', ' S', ' M', ' L', 'XL'];
        this.voteCards = [];
        this.voteCardTexts = [];

        // left-side current player card and text saying "You"
        this.playerCard = this.add.rectangle(475, 360, 70, 120, 0xEEF2F3).setStrokeStyle(2, 0xEEF2F3).setData("playerCardValue", "").setInteractive();
        this.playerChoice = this.add.text(465, 350, " ").setFontSize(20).setFontFamily('Trebuchet MS').setColor('black').setAlign('center').setInteractive();
        this.playerName = this.add.text(460, 425, "You").setFontSize(18).setFontFamily('Trebuchet MS').setColor('black').setAlign('center').setInteractive();

        // right-side other player card and text saying "Other Player"
        this.opponentCard = this.add.rectangle(955, 360, 70, 120, 0xEEF2F3).setStrokeStyle(2, 0xEEF2F3).setData("opponentCardValue", "").setInteractive();
        this.opponentChoice = this.add.text(945, 350, " ").setFontSize(20).setFontFamily('Trebuchet MS').setColor('black').setAlign('center').setInteractive();
        this.opponentName = this.add.text(905, 425, "Other Player").setFontSize(18).setFontFamily('Trebuchet MS').setColor('black').setAlign('center').setInteractive();

        // populate t-shirt size cards and texts
        for (let i = 0; i < cardWords.length; i++) {
            let voteCard = this.add.rectangle(475 + (i*120), 560, 80, 120, 0xffffff).setStrokeStyle(2, 0x007cba).setInteractive();
            let voteCardText = this.add.text((465+(i*120)), 550, cardWords[i]).setFontSize(20).setFontFamily('Trebuchet MS').setColor('#007cba').setAlign('center').setInteractive();
            
            voteCard.active = false;

            this.voteCards.push(voteCard)
            this.voteCardTexts.push(voteCardText);
        }

        // vote card is selected
        function selectCard(card, cardText) {
            card.setFillStyle(0x007cba);
            card.active = true; // to know if it's been selected
            
            cardText.setColor('white');

            // save the vote to the player's card
            self.playerCard.setData("playerCardValue", cardText.text);
            self.playerCard.setFillStyle(0x64828A);

            // make the revealCards button visible
            self.pickACard.visible = false;
            self.revealCardsButton.visible = true;
            self.revealText.visible = true;
        }

        // vote card is deselected
        function deselectCard(card, cardText) {
            card.setFillStyle(0xffffff);
            card.active = false; // to know it's been deselected

            cardText.setColor('#007cba');

            // reset the vote associated with the player's card
            self.playerCard.setData("playerCardValue", "");
            self.playerCard.setFillStyle(0xEEF2F3);

            // hide the revealCards button
            self.pickACard.visible = true;
            self.revealCardsButton.visible = false;
            self.revealText.visible = false;
        }

        // revealCards button is clicked
        function revealCardsButtonOnClick () {
            // show the player's choice
            self.playerCard.setFillStyle(0xEEF2F3);
            self.playerChoice.text = self.playerCard.data.list.playerCardValue; 

            // show the other player's choice
            self.opponentCard.setFillStyle(0xEEF2F3);
            self.opponentChoice.text = self.opponentCard.data.list.opponentCardValue; 

            // make the t-shirt vote cards unclickable
            for (let j = 0; j < self.voteCards.length; j++) {
                self.voteCards[j].disableInteractive();
            }

            // change the "Reveal Cards" text to "Play Again"
            self.revealText.text = "Play Again";

            // update the revealed parameter of the button
            //so we know it's been clicked once to reveal cards
            self.revealCardsButton.data.list.revealed = true;
        }

        // for any of the vote cards in the array
        for (let j = 0; j < this.voteCards.length; j++) {
            
            const voteCard = this.voteCards[j];
            const voteCardText = this.voteCardTexts[j];

            // if the voteCard is clicked
            voteCard.on('pointerdown', function () {

                // and it's already been clicked previously
                if (voteCard.active) {
                    // deselect the card
                    deselectCard(voteCard, voteCardText);
                    self.socket.emit('cardDeselected', self.isPlayerA);
                } 
                
                else {
                    // if a different card has been clicked (there's a vote already associated with the player)
                    if (self.playerCard.data.list.playerCardValue !== "") {
                        // determine which card it was based on saved value
                        const ind = cardWords.indexOf(self.playerCard.data.list.playerCardValue);
                        // deselect that card
                        deselectCard(self.voteCards[ind], self.voteCardTexts[ind]);
                    }
                    // select the current card that's been clicked
                    selectCard(voteCard, voteCardText);
                    self.socket.emit('cardChosen', self.isPlayerA, self.playerCard.data.list.playerCardValue);
                }
            })
        }

        // when revealCards button is clicked
        this.revealCardsButton.on('pointerdown', function () {

            /**
             * This If Statement doesn't work as intended as explained above
             * Logic: if the revealCards button has already been clicked
             *        and it's clicked again, then refresh the game
             */
            // if (self.revealCardsButton.data.list.revealed) {
            //     self.socket.emit('refreshGame');
            //     self.scene.restart();
            // }

            revealCardsButtonOnClick();
            self.socket.emit('revealCards');
        });

    }

    update() {

    }
}