import SpriteKit

public final class GameScene: SKScene {
    public weak var gameState: GameState? {
        didSet {
            if let gameState {
                gameLoop = GameLoop(gameState: gameState)
            }
        }
    }
    private var gameLoop: GameLoop?
    private var enemyManager: EnemyManager!
    private let beamManager = BeamManager()

    public override init(size: CGSize) {
        super.init(size: size)
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    public func configure(level: Level) {
        enemyManager = EnemyManager(bounds: frame.insetBy(dx: 32, dy: 32))
        enemyManager.spawn(from: level)
    }

    public func step(deltaTime: TimeInterval) {
        enemyManager?.step(deltaTime: deltaTime)
    }

    public override func update(_ currentTime: TimeInterval) {
        super.update(currentTime)
        gameLoop?.update(currentTime: currentTime)
    }
}
