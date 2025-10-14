import Foundation

/// Phase 0 deterministic RNG spike for Barrack+.
/// Run with `swift tools/rng_spike.swift` to verify repeatable outputs.
struct SplitMix64 {
    private var state: UInt64

    init(seed: UInt64) {
        state = seed &+ 0x9E3779B97F4A7C15
    }

    mutating func next() -> UInt64 {
        state &+= 0x9E3779B97F4A7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58476D1CE4E5B9
        z = (z ^ (z >> 27)) &* 0x94D049BB133111EB
        return z ^ (z >> 31)
    }
}

enum RNGStream: String {
    case levelLayout
    case enemySpawn
    case particleJitter

    var streamOffset: UInt64 {
        switch self {
        case .levelLayout: return 0
        case .enemySpawn: return 1
        case .particleJitter: return 2
        }
    }
}

struct RNGService {
    private var generator: SplitMix64

    init(seed: UInt64, stream: RNGStream) {
        generator = SplitMix64(seed: seed &+ (stream.streamOffset << 8))
    }

    mutating func nextUnit() -> Double {
        let value = generator.next()
        return Double(value) / Double(UInt64.max)
    }

    mutating func nextInt(max: Int) -> Int {
        precondition(max > 0, "max must be positive")
        return Int(generator.next() % UInt64(max))
    }

    mutating func shuffle<T>(_ items: [T]) -> [T] {
        var result = items
        for index in result.indices.reversed() {
            let swapIndex = result.startIndex + Int(generator.next() % UInt64(index + 1))
            result.swapAt(index, swapIndex)
        }
        return result
    }
}

func runSpike(seed: UInt64) {
    var layoutRNG = RNGService(seed: seed, stream: .levelLayout)
    var enemyRNG = RNGService(seed: seed, stream: .enemySpawn)

    var obstacleCoordinates: [(Int, Int)] = []
    for _ in 0..<3 {
        let x = layoutRNG.nextInt(max: 96)
        let y = layoutRNG.nextInt(max: 72)
        obstacleCoordinates.append((x, y))
    }

    let spawnSequence = enemyRNG.shuffle(["orbiter", "drifter", "sweeper"])

    print("Seed: \(seed)")
    print("Obstacle coordinates: \(obstacleCoordinates)")
    print("Enemy spawn order: \(spawnSequence)")
    let layoutSamples = (0..<3).map { _ in layoutRNG.nextUnit() }
    let enemySamples = (0..<3).map { _ in enemyRNG.nextUnit() }
    print("Layout unit samples: \(layoutSamples)")
    print("Enemy unit samples: \(enemySamples)")
}

runSpike(seed: 123456789)
runSpike(seed: 123456789)
runSpike(seed: 987654321)
