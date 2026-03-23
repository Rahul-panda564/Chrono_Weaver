class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vector2(this.x * n, this.y * n); }
    div(n) { return new Vector2(this.x / n, this.y / n); }
    
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() {
        const m = this.mag();
        return m === 0 ? new Vector2(0, 0) : this.div(m);
    }
    
    dot(v) { return this.x * v.x + this.y * v.y; }
    dist(v) { return this.sub(v).mag(); }
    
    lerp(v, t) { return this.add(v.sub(this).mult(t)); }
    
    copy() { return new Vector2(this.x, this.y); }
    
    static zero() { return new Vector2(0, 0); }
    static up() { return new Vector2(0, -1); }
    static right() { return new Vector2(1, 0); }
}