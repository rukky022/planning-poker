import Phaser from 'phaser';
import Game from './scenes/game';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1280,
    height: 780,
    backgroundColor: '#ffffff',
    scene: [Game]
};

const game = new Phaser.Game(config);
