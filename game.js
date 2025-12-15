let player, stars, cursors, score = 0, scoreText, platforms;

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.audio('jump', 'assets/jump.wav');
}

function create() {
    // الخلفية
    this.add.image(400, 300, 'sky');

    // المنصات
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // اللاعب
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // الحركات
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);

    // النجوم
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // لوحة التحكم بالكيبورد
    cursors = this.input.keyboard.createCursorKeys();

    // النقاط
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // الكاميرا تتبع اللاعب
    this.cameras.main.startFollow(player);

    // أزرار لمس للجوال مع نصوص الأسهم
    let leftButton = this.add.rectangle(50, 550, 80, 80, 0x0000ff).setInteractive();
    this.add.text(35, 540, '←', { fontSize: '32px', fill: '#fff' });

    let rightButton = this.add.rectangle(150, 550, 80, 80, 0x00ff00).setInteractive();
    this.add.text(135, 540, '→', { fontSize: '32px', fill: '#fff' });

    let jumpButton = this.add.rectangle(700, 550, 80, 80, 0xff0000).setInteractive();
    this.add.text(685, 540, '↑', { fontSize: '32px', fill: '#fff' });

    // الأحداث
    leftButton.on('pointerdown', () => { cursors.left.isDown = true; });
    leftButton.on('pointerup', () => { cursors.left.isDown = false; });

    rightButton.on('pointerdown', () => { cursors.right.isDown = true; });
    rightButton.on('pointerup', () => { cursors.right.isDown = false; });

    jumpButton.on('pointerdown', () => { cursors.up.isDown = true; });
    jumpButton.on('pointerup', () => { cursors.up.isDown = false; });
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
        this.sound.play('jump');
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
}