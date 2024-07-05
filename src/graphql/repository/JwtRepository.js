import { Jwt } from '../../models/jwtTokens.js';
export class JwtRepository {
  static findJwtById = async (jwtId) => {
    const jwtDocument = await Jwt.findOne({ uuid: jwtId });
    return jwtDocument;
  };
}
