const { prisma } = require("../prisma/client");

const organizationOutputData = {
  organization_id: true,
  created_at: true,
  updated_at: true,
  name: true,
  location: true,
  phone_number: true,
  email: true,
};

async function getOrganization(id) {
  const organization = await prisma.organization.findFirst({
    where: {
      organization_id: id,
    },
    select: organizationOutputData,
  });

  if (organization) {
    return organization;
  }
  return;
}
module.exports = {
  getOrganization,
};
