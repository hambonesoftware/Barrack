import XCTest
@testable import BarrackPlus

final class IntegrationSimTests: XCTestCase {
    func testLevelConfigurationLoadsFromJSON() throws {
        let manager = LevelManager()
        XCTAssertFalse(manager.levels.isEmpty)
        XCTAssertGreaterThan(manager.currentLevel.targetPercent, 0.5)
    }
}
