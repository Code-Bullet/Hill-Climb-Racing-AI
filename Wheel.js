class Wheel {
  constructor(x, y, r, chassisBody, world) {

    this.startingPosition = createVector(x, y);
    this.radius = r;
    this.body;
    this.world = world;
    this.id = "wheel";
    this.onGround = false;
    this.createBody();

    this.rimBody;
    let bodyDef = new b2BodyDef();
    bodyDef.type = b2DynamicBody;

    bodyDef.position.x = this.startingPosition.x / SCALE;
    bodyDef.position.y = this.startingPosition.y / SCALE;
    bodyDef.angle = 0;

    let fixDef = new b2FixtureDef();
    fixDef.density = 0.05;
    fixDef.friction = 0.99;
    fixDef.restitution = 0.2;
    fixDef.shape = new b2CircleShape(this.radius / SCALE);


    this.rimBody = this.world.CreateBody(bodyDef);


    var filtData = new b2FilterData();
    filtData.groupIndex = -1;
    this.rimBody.CreateFixture(fixDef).SetFilterData(filtData);

    this.rimBody.SetUserData(this);

    if (chassisBody != null) {
      var revJointDef = new b2RevoluteJointDef();
      revJointDef.Initialize(this.body, this.rimBody, this.body.GetPosition());
      this.joint = this.world.CreateJoint(revJointDef);
    }

    if (chassisBody != null) {
      var prisJointDef = new b2PrismaticJointDef();
      prisJointDef.Initialize(this.rimBody, chassisBody, this.body.GetPosition(), new Vec2(0, -1));
      this.prisJoint = this.world.CreateJoint(prisJointDef);



      var distJointDef = new b2DistanceJointDef();
      var anchorWheel = new Vec2(x / SCALE, y / SCALE);
      var anchorCar = new Vec2((x) / SCALE, (y - r * 3) / SCALE);
      distJointDef.Initialize(this.rimBody, chassisBody, anchorWheel, anchorCar);
      distJointDef.frequencyHz = 70;
      distJointDef.dampingRatio = 25;
      this.distJoint = this.world.CreateJoint(distJointDef);



      // var weldJointDef = new b2WeldJointDef();
      // weldJointDef.Initialize(this.rimBody, chassisBody, anchorWheel);
      // this.weldJoint = this.world.CreateJoint(weldJointDef);
      //


    }
    this.body.SetAngularDamping(1.8);



  }


  createBody() {
    let bodyDef = new b2BodyDef();
    bodyDef.type = b2DynamicBody;

    bodyDef.position.x = this.startingPosition.x / SCALE;
    bodyDef.position.y = this.startingPosition.y / SCALE;
    bodyDef.angle = 0;

    let fixDef = new b2FixtureDef();
    fixDef.density = 1;
    fixDef.friction = 1.5; //0.99;
    fixDef.restitution = 0.1;
    fixDef.shape = new b2CircleShape(this.radius / SCALE);

    this.body = this.world.CreateBody(bodyDef);

    var filtData = new b2FilterData();
    // filtData.groupIndex = -1;
    filtData.categoryBits = WHEEL_CATEGORY;
    filtData.maskBits = WHEEL_MASK;
    this.body.CreateFixture(fixDef).SetFilterData(filtData);
    this.body.SetUserData(this);

  }

  show() {
    push();

    let x = this.body.GetPosition().x * SCALE;
    let y = this.body.GetPosition().y * SCALE;
    let angle = this.body.GetAngle();
    translate(x - panX, y - panY);
    rotate(angle);

    image(wheelSprite, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

    pop();

  }



}
