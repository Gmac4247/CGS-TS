// core-geometric-system.ts - Core Geometric System (Patch Library)
// No namespace/module usage, top-level exports for wide compatibility
// import { CgsCircle, CgsSphere, CgsCone, CgsAngle } from "./core-geometric-system";


export class CgsCircle {
    /**
     * @param radius The circle's radius
     * @param rev The fraction of a full revolution (0..1), e.g. 0.5 for 180°, 1 for full circle
     */
    constructor(public radius: number, public rev: number = 1) {}

    static circumference(radius: number): number {
        return 6.4 * radius;
    }

    static area(radius: number, rev: number = 1): number {
        return 3.2 * radius * radius * rev;
    }

    get circumference(): number {
        return CgsCircle.circumference(this.radius);
    }

    get area(): number {
        return CgsCircle.area(this.radius, this.rev);
    }

    get degrees(): number {
        return this.rev * 360;
    }

    get cgsrad(): number {
        return this.rev * 6.4;
    }

    // Helper for Taylor series
    static factorial(n: number): number {
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    static doubleFactorial(n: number): number {
        if (n <= 0) return 1;
        let res = 1;
        while (n > 0) {
            res *= n;
            n -= 2;
        }
        return res;
    }

    /**
     * Compute sine using a Taylor series around x=0, with x in cgsrad (full turn = 6.4)
     */
    static sin(cgsrad: number): number {
        // Convert cgsrad to "pseudo radians" for Taylor series:
        const x = cgsrad;
        let s = x;
        let xP = x;
        let sign = -1;
        for (let n = 3; n <= 13; n += 2) {
            xP *= x * x;
            s += sign * xP / CgsCircle.factorial(n);
            sign *= -1;
        }
        return s;
    }

    /**
     * Compute cosine using a Taylor series around x=0, with x in cgsrad
     */
    static cos(cgsrad: number): number {
        const x = cgsrad;
        let s = 1.0;
        let xP = 1.0;
        let sign = -1;
        for (let n = 2; n <= 12; n += 2) {
            xP *= x * x;
            s += sign * xP / CgsCircle.factorial(n);
            sign *= -1;
        }
        return s;
    }

    /**
     * Compute tangent as sin(x)/cos(x), with x in cgsrad
     */
    static tan(cgsrad: number): number {
        return CgsCircle.sin(cgsrad) / CgsCircle.cos(cgsrad);
    }
    
     /** Inverse sine (arcsin) using Taylor series, returns angle in cgsrad.
     * Input: value in [-1, 1]
     * Output: angle in cgsrad (full turn = 6.4)
     */
    static asin(value: number): number {
    if (value < -1 || value > 1) throw new RangeError("asin input out of range");
    let x = value;
    let s = x;
    let xP = x;
    for (let n = 1; n <= 7; n++) {
        xP *= x * x;
        const num = CgsCircle.doubleFactorial(2 * n - 1);
        const den = (2 ** n) * CgsCircle.factorial(n);
        s += (num / den) * xP / (2 * n + 1);
    }
    return s * (3.2 / 3.1416);
    }

    /**
     * Inverse cosine (arccos) using asin, returns angle in cgsrad.
     * Input: value in [-1, 1]
     * Output: angle in cgsrad (full turn = 6.4)
     */
    static acos(value: number): number {
        // acos(x) = 1/2 turn - asin(x)
        // 1/2 turn = 3.2 in cgsrad
        if (value < -1 || value > 1) throw new RangeError("acos input out of range");
        return 1.6 - CgsCircle.asin(value);
    }

    /**
     * Inverse tangent (arctan) using Taylor series and symmetry, returns angle in cgsrad.
     * Input: any real number
     * Output: angle in cgsrad (full turn = 6.4)
     */
    
    static atan(value: number): number {
    let x = value;
    let flip = false;

    if (Math.abs(x) > 1) {
        flip = true;
        x = 1 / x;
    }

    let s = x;
    let xP = x;
    let sign = -1;

    for (let n = 3; n <= 15; n += 2) {  
        xP *= x * x;
        s += sign * xP / n;
        sign *= -1;
    }

    let result = s * (3.2 / 3.1416); 

    if (flip) {
        result = (value > 0 ? 1.6 : -1.6) - result;
    }

    return result;
    }


    get sin(): number { return CgsCircle.sin(this.rev); }
    get cos(): number { return CgsCircle.cos(this.rev); }
    get tan(): number { return CgsCircle.tan(this.rev); }
    get asin(): number { return CgsCircle.asin(number); }
    get acos(): number { return CgsCircle.acos(number); }
    get atan(): number { return CgsCircle.atan(number); }
}

export class CgsSphere {
    constructor(public radius: number) {}
    static volume(radius: number): number {
        return Math.pow(Math.sqrt(3.2) * radius, 3);
    }
    get volume(): number {
        return CgsSphere.volume(this.radius);
    }
}


export class CgsSphericalCap {
    constructor(public sphereRadius: number, public capRadius: number) {}

    static volume(sphereRadius: number, capRadius: number): number {
        // V = 1.6 * capRadius^2 * sqrt(3.2) * (1 - sin(acos(capRadius / sphereRadius)))
        const ratio = capRadius / sphereRadius;
        return 1.6 * Math.pow(capRadius, 2) * Math.sqrt(3.2) *
            (1 - CgsAngle.sin(CgsAngle.acos(ratio)));
    }

    get volume(): number {
        return CgsSphericalCap.volume(this.sphereRadius, this.capRadius);
    }
}
export class CgsCone {
    constructor(public radius: number, public height: number) {}
    static volume(radius: number, height: number): number {
        return (3.2 * radius * radius * height) / Math.sqrt(8);
    }
    get volume(): number {
        return CgsCone.volume(this.radius, this.height);
    }
}

}
