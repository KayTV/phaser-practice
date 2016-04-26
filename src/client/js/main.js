console.log('SANITY');
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', '../assets/MarioLevelBackground.png');
    game.load.image('ground', '../assets/ground.png');
    game.load.image('star', '../assets/star.png');
		game.load.image('box', '../assets/ledge2.png');
		game.load.image('littlebox', '../assets/box.png');
		game.load.image('pipe', '../assets/pipe2.png');
		game.load.image('bullet', '../assets/bullet2.png')
    game.load.spritesheet('dude', '../assets/MegaManWholeTest.png', 42, 49);
		// game.load.spritesheet('dudejump', 'assets/MegaManTestJump.png', 39, 61);

}

var player;
var platforms;
var cursors;
var bullets;

var stars;
var score = 0;
var scoreText;
var fireRate = 100;
var nextFire = 0;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    // ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(250, 350, 'box');
    ledge.body.immovable = true;

    ledge = platforms.create(100, 350, 'littlebox');
    ledge.body.immovable = true;

		ledge = platforms.create(350, 200, 'littlebox');
    ledge.body.immovable = true;

		ledge = platforms.create(580, 450, 'pipe');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    // game.physics.arcade.enable(player, Phaser.Physics.ARCADE);
		player.anchor.set(0.5);

    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 20, true);
    player.animations.add('right', [6, 7, 8, 9], 20, true);
		player.animations.add('jump', [10], 20, true);
		player.animations.add('jumpdown', [18], 20, true);

		bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(50, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

		//  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
		fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
		else if(cursors.up.isDown)
		{
			player.animations.play('jump');
		}
		else if(cursors.down.isDown)
		{
			player.animations.play('jumpdown');
		}
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
		else if(fireButton.isDown)
		{
			fire();
		}
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 5;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

}

function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();

		//  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;

}

function fire() {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstDead();

        bullet.reset(player.x, player.y);

        game.physics.arcade.moveToXY(bullet, 500, 500, 400);
    }

}

function render() {

    game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 32, 32);
    game.debug.spriteInfo(player, 32, 450);

}
