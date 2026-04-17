const schemaOptions = {
  versionKey: false,
  timestamps: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
};

module.exports = schemaOptions;
