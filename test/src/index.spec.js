/* eslint no-unused-expressions: 0 */
/* global expect, request, describe, it, before, after */
import '../setup';

const NEDB = require('../../src/index');

// Create instance
const nedb = new NEDB({
  inMemoryOnly: true
});

// Mock validation method, this is automatically done by the model
const validate = (body) => {
  // Test validation failure by passing `failValidate: true`
  if (body.failValidate) {
    return { error: true };
  }
  // Mock passing validation, return null
  return null;
};

// Mock sanitize method, this is automatically done by the model
const sanitize = (body) => {
  return body;
};

// Inherit
nedb.validate = validate;
nedb.sanitize = sanitize;

describe('nedb', () => {
  describe('construct', () => {
    it('creates a new instance of the adapter', () => {
      // Instantiate
      const nedbConstruct = new NEDB({
        inMemoryOnly: true
      });
      // Ensure object
      expect(nedbConstruct).to.be.an.object;
      // Ensure db has been created
      expect(nedbConstruct).to.have.property('db');
    });
  });

  describe('inherit', () => {
    it('inherits new methods from modli core', () => {
      // Instantiate
      const nedbInherit = new NEDB({
        inMemoryOnly: true
      });
      // Extend with validate and sanitize
      nedbInherit.validate = validate;
      nedbInherit.sanitize = sanitize;
      expect(nedb.validate).to.be.a.function;
    });
  });

  describe('create', () => {
    it('fails when validation does not pass', (done) => {
      nedb.create({
        failValidate: true
      })
      .catch((err) => {
        expect(err).to.have.property('error');
        done();
      });
    });
    it('creates an entry when passed an object', (done) => {
      nedb.create({
        name: 'jsmith',
        email: 'jsmith@gmail.com'
      }, 1)
      .then((data) => {
        expect(data).to.be.an.object;
        done();
      })
      .catch((err) => done(err));
    });
  });

  describe('read', () => {
    let testId;

    before((done) => {
      nedb.create({
        name: 'jsmith',
        email: 'jsmith@gmail.com'
      })
      .then((data) => {
        expect(data).to.be.an.object;
        testId = data._id;
        done();
      })
      .catch((err) => done(err));
    });

    it('reads an item when passed a query object', (done) => {
      nedb.read({ _id: testId }, 1)
        .then((data) => {
          expect(data[0].name).to.equal('jsmith');
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('update', () => {
    let testId;

    before((done) => {
      nedb.create({
        name: 'jsmith',
        email: 'jsmith@gmail.com'
      })
      .then((data) => {
        expect(data).to.be.an.object;
        testId = data._id;
        done();
      })
      .catch((err) => done(err));
    });

    it('fails when validation does not pass', (done) => {
      nedb.create({
        failValidate: true
      })
      .catch((err) => {
        expect(err).to.have.property('error');
        done();
      });
    });
    it('updates an items based on query and object passed', (done) => {
      nedb.update({ _id: testId }, {
        name: 'jsmith1'
      }, 1)
      .then((numUpdated) => {
        expect(numUpdated).to.equal(1);
        done();
      })
      .catch((err) => done(err));
    });
  });

  describe('delete', () => {
    let testId;

    before((done) => {
      nedb.create({
        name: 'jsmith',
        email: 'jsmith@gmail.com'
      })
      .then((data) => {
        expect(data).to.be.an.object;
        testId = data._id;
        done();
      })
      .catch((err) => done(err));
    });

    it('deletes and item when passed a query', (done) => {
      nedb.delete({ _id: testId })
        .then((numDeleted) => {
          expect(numDeleted).to.equal(1);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('extend', () => {
    it('extends the adapter with a new method', () => {
      // Extend
      nedb.extend('sayFoo', () => {
        return 'foo';
      });
      // Execute
      expect(nedb.sayFoo()).to.equal('foo');
    });
  });
});
