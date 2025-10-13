import XCTest
@testable import BarrackPlus

final class PhysicsTests: XCTestCase {
    func testReflectionFlipsVelocity() {
        let velocity = CGVector(dx: 1, dy: 0)
        let reflected = Physics.reflect(velocity: velocity, normal: CGVector(dx: -1, dy: 0))
        XCTAssertEqual(reflected.dx, -1, accuracy: 0.0001)
        XCTAssertEqual(reflected.dy, 0, accuracy: 0.0001)
    }
}
