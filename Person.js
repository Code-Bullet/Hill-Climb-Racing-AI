class Person {
  constructor(x, y, personWidth, personHeight, world) {
    this.world = world;

    this.x = x;
    this.y = y;
    this.height = personHeight;
    this.width = personWidth;
    this.torso = new Torso(x, y - (personHeight / 2), personHeight, personWidth, this.world);
    this.head = new Head(x, y - (personHeight + personWidth * 1), personWidth * 1, this.world);
    var revJointDef = new b2RevoluteJointDef();
    var jointPos = new Vec2(x / SCALE, (y - personHeight) / SCALE);

    revJointDef.Initialize(this.head.body, this.torso.body, jointPos);
    this.headJoint = this.world.CreateJoint(revJointDef);



    var distJointDef = new b2DistanceJointDef();
    var anchorTorso = new Vec2(x / SCALE, (y) / SCALE);
    var anchorHead = new Vec2(x / SCALE, this.head.startingPosition.y / SCALE);
    distJointDef.Initialize(this.head.body, this.torso.body, anchorHead, anchorTorso);
    this.distJoint = this.world.CreateJoint(distJointDef);



  }


  show() {
    this.head.show();
    this.torso.show();
  }

}


class Head {
  constructor(x, y, r, world) {
    this.world = world;
    this.startingPosition = createVector(x, y);
    this.radius = r;
    this.body;
    this.id = "head";
    this.makeBody();
    this.isCB = false;
  }

  makeBody() {
    let bodyDef = new b2BodyDef();
    bodyDef.type = b2DynamicBody;


    bodyDef.position.x = this.startingPosition.x / SCALE;
    bodyDef.position.y = this.startingPosition.y / SCALE;
    bodyDef.angle = 0;

    let fixDef = new b2FixtureDef();
    fixDef.density = 0.001;
    fixDef.friction = 0.01;
    fixDef.restitution = 0.01;
    fixDef.shape = new b2CircleShape(this.radius / SCALE);

    this.body = this.world.CreateBody(bodyDef);
    this.body.SetUserData(this);

    var filtData = new b2FilterData();
    filtData.categoryBits = PERSON_CATEGORY;
    filtData.maskBits = PERSON_MASK;
    this.body.CreateFixture(fixDef).SetFilterData(filtData);

  }

  show() {
    let x = this.body.GetPosition().x * SCALE;
    let y = this.body.GetPosition().y * SCALE;
    let angle = this.body.GetAngle();
    push();


    translate(x - panX, y - panY);
    rotate(angle);
    if (cbHead) {
      image(CBHeadSprite, -this.radius - 7, -this.radius - 15, this.radius * 3, this.radius * 3);
    } else {
      image(headSprite, -this.radius - 8, -this.radius - 15, this.radius * 3, this.radius * 3);
    }
    pop();
  }
}


class Torso {

  constructor(centerX, centerY, height, width, world) {
    this.id = "torso";
    this.world = world;
    this.width = width;
    this.height = height;
    this.startingPosition = createVector(centerX, centerY);
    this.body;
    this.colour = color(0, 0, 0);
    this.makeBody();


  }
  makeBody() {
    let bodyDef = new b2BodyDef();
    bodyDef.type = b2DynamicBody;
    bodyDef.position.x = this.startingPosition.x / SCALE;
    bodyDef.position.y = this.startingPosition.y / SCALE;
    bodyDef.angle = 0;

    let fixDef = new b2FixtureDef();
    fixDef.density = 0.002;
    fixDef.friction = 0.01;
    fixDef.restitution = 0.01;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(this.width / 2 / SCALE, this.height / 2 / SCALE);

    this.body = this.world.CreateBody(bodyDef);
    this.body.SetUserData(this);

    var filtData = new b2FilterData();
    // filtData.groupIndex = -1;
    filtData.categoryBits = PERSON_CATEGORY;
    filtData.maskBits = PERSON_MASK;
    this.body.CreateFixture(fixDef).SetFilterData(filtData);

  }


  show() {

    let x = this.body.GetPosition().x * SCALE;
    let y = this.body.GetPosition().y * SCALE;
    let angle = this.body.GetAngle();
    push();
    translate(x - panX, y - panY);
    rotate(angle);
    // fill(60, 80, 10);
    fill(this.colour);
    // noStroke();
    stroke(0);
    strokeWeight(1);
    rectMode(CENTER);
    rect(0, 0, this.width, this.height);
    pop();

  }


}
