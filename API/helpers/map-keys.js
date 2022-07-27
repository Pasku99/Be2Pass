const WorkGroup = require('../models/workgroups');
const User = require('../models/users');

const mapKeys = async(keys) => {
    return await Promise.all(keys.map(async(key) => ({
      id: key.id,
      key: key.key,
      user: await User.findById(key.userId),
      username: key.username,
      service: key.service,
      URL: key.URL,
      isShared: key.isShared,
      workGroup: await WorkGroup.findById(key.groupId)
    })))
}

module.exports = { mapKeys }